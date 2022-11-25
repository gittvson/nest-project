export default function (listTable) {
  let sql = getSelectStatement(listTable);

  for (let i = 0; i < listTable.length - 1; i++) {
    let joinKeys = getSameKeys(
      Object.values(listTable[i].object),
      Object.values(listTable[i + 1].object),
    );
    sql +=
      (i === 0
        ? ` \nFROM "${listTable[i].tableName}" \nJOIN "${
            listTable[i + 1].tableName
          }"`
        : ` \nJOIN "${listTable[i + 1].tableName}"`) +
      getConditionsForJoin(
        joinKeys,
        listTable[i].tableName,
        listTable[i + 1].tableName,
      );
  }

  return sql;
}

function getSameKeys(keys1, keys2) {
  let result = [];
  for (const key1 of keys1) {
    for (const key2 of keys2) {
      if (key1 === key2) result.push(key1);
    }
  }
  return result;
}

function getSelectStatement(listTable) {
  let sql = 'SELECT ';

  for (let i = 0; i < listTable.length; i++) {
    for (const key of Object.keys(listTable[i].object)) {
      sql += ` "${listTable[i].tableName}"."${listTable[i].object[key]}" as "${key}",`;
    }
  }
  return sql.slice(0, -1);
}

function getConditionsForJoin(joinKeys, tableName1, tableName2) {
  let result = '';
  for (let i = 0; i < joinKeys.length; i++) {
    result +=
      (i === 0 ? ' ON ' : ' AND ') +
      `"${tableName1}"."${joinKeys[i]}" = "${tableName2}"."${joinKeys[i]}"`;
  }
  return result;
}
