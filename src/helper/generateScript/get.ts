import { stringConnection } from './commonData';

export default function generateScript(tableName, object) {
  return `
  const { Pool } = require('pg');

const pool = new Pool({
 ${stringConnection}
});

const ${tableName} = \`"${tableName}"\`;

const columnName = {
  ${getColumnNames(object)}
};

const columnNameAlias = {
  ${getColumnNameAliases(object)}
};
exports.handler = async (event, context, callback) => {
  let { page = 1, pageSize = 10, sort = {}, search = {}, fullSearch } = event;

  if (!isValidPayload(page, pageSize)) {
    return response(600, false, 'Invalid payload');
  }

  page = validRange(page, 1, 1);
  pageSize = validRange(pageSize, 1, 10);

  let current\$ = { value: 0 },
    values = [];

  let sql = \`SELECT 
  ${getColumn1(object)}
  FROM \${${tableName}}
  WHERE 1 = 1
  \${getFullFieldConditionCommand(fullSearch, current\$, values)}
  \${getConditionsCommandV2(search, current\$, values)}
  \${getSortCommand(sort)}
  \`;

  sql += ' LIMIT ' + pageSize + ' OFFSET ' + getOffset(page, pageSize);

  let current\$OfGetTotalRecordsCommand = { value: 0 };
  let valuesOfGetTotalRecordsCommand = [];

  try {
    const getTotalRecordsText = getSqlWithCondidtionV2(
      'SELECT COUNT(*) FROM ' + ${tableName} + ' WHERE 1=1',
      search,
      fullSearch,
      current\$OfGetTotalRecordsCommand,
      valuesOfGetTotalRecordsCommand,
    );
    const totalRecordsRes = await pool.query({
      text: getTotalRecordsText,
      values: valuesOfGetTotalRecordsCommand,
    });
    let totalRecords = 0;
    if (totalRecordsRes?.rows && totalRecordsRes.rows?.length > 0)
      totalRecords = totalRecordsRes.rows[0].count;
    const res = await pool.query({ text: sql, values });
    let rows = res.rows;
    let paginationInfo = {
      totalRecords,
      page,
      pageSize,
    };

    const result = {
      paginationInfo,
      items: rows,
    };
    return response(200, true, result);
  } catch (err) {
    console.log(err);
    return response(500, false, err);
  }
};

function getSortCommand(sort) {
  let exist = convertToColumnName(sort?.field);
  if (!exist) {
    return '';
  }
  return \` ORDER BY \${exist} \${
    sort.isIncrement === null ||
    sort.isIncrement === undefined ||
    sort.isIncrement
      ? 'asc'
      : 'desc'
  }\`;
}

function response(code, success, data) {
  return {
    code,
    success,
    data,
  };
}

function getOffset(page, pageSize) {
  return (page - 1) * pageSize;
}

function convertToColumnName(name) {
  const obj = {
    ${getColumn2(object)}
  };
  return obj[name] ?? null;
}

function getConditionsCommandV2(search, current\$, values) {
  if (!(Object.keys(search).length > 0)) return '';

  let result = '';
  for (let key in search) {
    result += getOneConditionCommand(search[key], key, current\$, values);
  }

  return result;
}

function getOneConditionCommand(condition, field, current\$, values) {
  const op = Object.keys(condition)[0];
  const columnName = convertToColumnName(field);
  //if the input operator is not exists
  if (
    op !== 'equals' &&
    op !== 'lt' &&
    op !== 'lte' &&
    op !== 'gt' &&
    op !== 'gte' &&
    op !== 'in' &&
    op !== 'betweens' &&
    op !== 'contains'
  )
    return '';

  // if use in operator
  if (
    op === 'in' &&
    ((condition[op] &&
      !isNaN(condition[op].length) &&
      condition[op].length === 0) ||
      !condition[op])
  ) {
    return '';
  }

  if (
    op === 'betweens' &&
    ((condition[op] &&
      !isNaN(condition[op].length) &&
      condition[op].length !== 2) ||
      !condition[op])
  ) {
    return '';
  }

  // arr\$ use for in operator because we have the array of value when use in operator
  let arr\$ = [];
  if (op == 'contains') {
    values.push('%' + condition[op] + '%');
  } else if (op === 'in' || op === 'betweens') {
    for (let i = 0; i < condition[op].length; i++) {
      values.push(condition[op][i]);
      arr\$.push('\$' + (current\$.value + (i + 1)));
    }
  } else {
    values.push(condition[op]);
  }
  if (op === 'in') {
    current\$.value += condition[op].length;
  } else current\$.value++;

  if (op === 'equals') {
    return \` AND \${columnName} = \$\${current\$.value}\`;
  }
  if (op === 'lt') {
    return \` AND \${columnName} < \$\${current\$.value}\`;
  }
  if (op === 'lte') {
    return \` AND \${columnName} <= \$\${current\$.value}\`;
  }
  if (op === 'gt') {
    return \` AND \${columnName} > \$\${current\$.value}\`;
  }
  if (op === 'gte') {
    return \` AND \${columnName} >= \$\${current\$.value}\`;
  }
  if (op === 'contains') {
    return \` AND \${columnName} ILIKE \$\${current\$.value}\`;
  }
  if (op === 'in') {
    return \` AND \${columnName} IN(\${arr\$.join(',')})\`;
  }
  if (op === 'betweens') {
    return \` AND \${columnName} BETWEEN \${arr\$[0]} AND \${arr\$[1]}\`;
  }
}

function getSqlWithCondidtionV2(sql, search, fullSearch, current\$, values) {
  return (
    sql +
    getConditionsCommandV2(search, current\$, values) +
    getFullFieldConditionCommand(fullSearch, current\$, values)
  );
}

function isValidPayload(page, pageSize) {
  if (isNaN(page) || isNaN(pageSize)) return false;

  return true;
}

function validRange(value, limit, tempValue) {
  if (value < limit) {
    return tempValue;
  } else return value;
}

function getFullFieldConditionCommand(fullSearch, current\$, values) {
  if (!fullSearch) return '';
  current\$.value++;
  values.push(\`%\${fullSearch}%\`);
  return \` AND concat( ${getColumn3(object)} ) ILIKE \$\${current\$.value}\`;
}
`;
}

function getColumnNames(object) {
  let result = '';
  for (let key in object) {
    result += `${key}: \`"${object[key]}"\`,`;
  }
  return result;
  //   return `id: \`"PRODUCT_ID"\`,
  //     external_id: \`"PRODUCT_EXTERNAL_ID"\`,
  //     name: \`"PRODUCT_NAME"\`,
  //     desc: \`"PRODUCT_DESC"\`,
  //     brand_color: \`"PRODUCT_BRAND_COLOR"\`,
  //     brand_thumb_url: \`"PRODUCT_BRAND_THUMB_URL"\`,`;
}

function getColumnNameAliases(object) {
  let result = '';
  for (let key in object) {
    result += `${key}: \`"${key}"\`,`;
  }
  return result;
  //   return `id: \`"PRODUCT_ID"\`,
  //     external_id: \`"PRODUCT_EXTERNAL_ID"\`,
  //     name: \`"PRODUCT_NAME"\`,
  //     desc: \`"PRODUCT_DESC"\`,
  //     brand_color: \`"PRODUCT_BRAND_COLOR"\`,
  //     brand_thumb_url: \`"PRODUCT_BRAND_THUMB_URL"\`,`;
}

function getColumn1(object) {
  let result = '';
  for (let key in object) {
    result += `
            \${columnName.${key}} as \${columnNameAlias.${key}},`;
  }
  return result.slice(0, -1);
  // `\${columnName.id} as \${columnNameAlias.id},
  // \${columnName.external_id} as \${columnNameAlias.external_id},
  // \${columnName.name} as \${columnNameAlias.name},
  // \${columnName.desc} as \${columnNameAlias.desc},
  // \${columnName.brand_color} as \${columnNameAlias.brand_color},
  // \${columnName.brand_thumb_url} as \${columnNameAlias.brand_thumb_url}`
}

function getColumn2(object) {
  let result = '';
  for (let key in object) {
    result += `${key}: columnName.${key},`;
  }
  return result.slice(0, -1);
  // name: columnName.feature_name,
}

function getColumn3(object) {
  let result = '';
  for (let key in object) {
    result += `\${columnName.${key}},`;
  }
  return result.slice(0, -1);
  // name: columnName.feature_name,
}
