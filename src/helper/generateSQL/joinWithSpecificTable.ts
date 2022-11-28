export default function (listTable) {
  let sql = getSelectStatementV2(listTable);
  let listJoinedTables = [];
  let firstTime = true;
  for (let i = 0; i < listTable.length; i++) {
    listJoinedTables = listTable[i].joinedTables;
    if (listJoinedTables && listJoinedTables.length > 0) {
      for (let j = 0; j < listJoinedTables.length; j++) {
        sql += getFullJoinCondition(
          listTable[i],
          listTable[getIndexOfTable(listJoinedTables[j], listTable)],
          firstTime,
        );
        if (firstTime) firstTime = false;
      }
    }
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

function getSelectStatementV2(listTable) {
  let sql = 'SELECT ';
  let index = 0;
  for (let i = 0; i < listTable.length; i++) {
    if (listTable[i].main !== true) {
      for (const key of Object.keys(listTable[i].object)) {
        sql += getStringJsonForKey(
          listTable[i].tableName,
          listTable[i].object[key],
          key,
          index === 0
            ? 'first'
            : index === Object.keys(listTable[i].object).length - 1
            ? 'last'
            : 'normal',
        );
        index++;
      }
    } else {
      for (const key of Object.keys(listTable[i].object)) {
        sql += ` "${listTable[i].tableName}"."${listTable[i].object[key]}" as "${key}",`;
      }
    }
    index = 0;
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

function getIndexOfTable(tableName, listTable) {
  for (let i = 0; i < listTable.length; i++) {
    if (listTable[i].tableName == tableName) {
      return i;
    }
  }
}

function getFullJoinCondition(table1, table2, first) {
  let joinKeys = getSameKeys(
    Object.values(table1.object),
    Object.values(table2.object),
  );
  return (
    (first
      ? ` \nFROM "${table1.tableName}" \nJOIN "${table2.tableName}"`
      : ` \nJOIN "${table2.tableName}"`) +
    getConditionsForJoin(joinKeys, table1.tableName, table2.tableName)
  );
}

function getStringJsonForKey(tableName, name, nameAlias, position) {
  if (position === 'first') {
    // if (nameAlias.toLowerCase().indexOf('id') !== -1)
    //   return `'{"${nameAlias}":"'||"${tableName}"."${name}"||'",'||`;
    // else
    return `'{"${nameAlias}":"'||COALESCE("${tableName}"."${name}",'null')||'",'||`;
  }
  if (position === 'last') {
    // if (nameAlias.toLowerCase().indexOf('id') !== -1)
    //   return `'"${nameAlias}":"'||"${tableName}"."${name}"||'"}' as "${tableName}",`;
    // else
    return `'"${nameAlias}":"'||COALESCE("${tableName}"."${name}",'null')||'"}' as "${tableName}",`;
  }
  // if (nameAlias.toLowerCase().indexOf('id') !== -1)
  //   return `'"${nameAlias}":"'||"${tableName}"."${name}"||'",'||`;
  // else
  return `'"${nameAlias}":"'||COALESCE("${tableName}"."${name}",'null')||'",'||`;
}
