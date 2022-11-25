import { Injectable } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import generateScript from './helper/generateScript';
import sql from './helper/generateSQL';
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  generateScript(type, tableName, object): string {
    if (type === 'create') return generateScript.create(tableName, object);

    if (type === 'get') return generateScript.get(tableName, object);

    if (type === 'delete') return generateScript._delete(tableName, object);
  }

  generateSql(listTable, type): string {
    if ((type = 'specific')) return sql.joinWithSpecificTable(listTable);
    return sql.join(listTable);
  }
}

// function generateScript(tableName, object) {
//   return `const { Pool } = require("pg");
// const { v4 } = require("uuid");
// const validator = require("validator");

// const pool = new Pool({
//   user: "postgres",
//   host: "testdbofson-1-instance-1.caxbihou6kbt.ap-southeast-1.rds.amazonaws.com",
//   database: "PT",
//   password: "12345678",
//   port: 5432,
// });
// const columnName = {
//   ${getColumnNames(object)}
//   };
// const columnNameAlias = {
//   ${getColumnNameAliases(object)}
// };

// const ${tableName} = \`"${tableName}"\`;
// exports.handler = async (event, context, callback) => {
//   const client = await pool.connect();

//   try {
//     const {
//       ${getKeys(object)}
//     } = event;

//     let sql;
//     let values;
//     let existItem;
//     let newId;

//     await client.query("BEGIN");

//     if (id) {
//       existItem = await checkExist(id, client);
//       if (!existItem) {
//         return response(600, false, "Item is not exists");
//       }
//       sql = getCreateOrUpdateSqlStatement("update");
//       values = [
//         ${getValueForCreateStatement(object)}
//         id
//       ];

//     } else {
//       newId = v4();
//       sql = getCreateOrUpdateSqlStatement("create");
//       values = [
//         newId,
//         ${getValueForUpdateStatement(object)}
//       ];
//     }
//     const res = await client.query({ text: sql, values });

//     const result = getFirstRowOfRes(res);

//     await client.query("COMMIT");
//     return response(200, true, result);
//   } catch (err) {
//     await client.query("ROLLBACK");
//     return response(500, false, err);
//   } finally {
//     client.release();
//   }
// };

// function response(code, success, data) {
//   return {
//     code,
//     success,
//     data,
//   };
// }

// async function checkExist(id, client) {
//   let res = await client.query({
//     text: \`SELECT
//     ${getColumn1(object)}
//     FROM \${${tableName}}
//     WHERE \${columnName.id} = \$1\`,
//     values: [id],
//   });

//   if (res.rows && res.rows.length > 0)
//     return res.rows[0];

//   return null;
// }

// function getCreateOrUpdateSqlStatement(operator) {
//   if (operator === "create")
//     return ${getCreateStatement(object, tableName)};

//   return ${getUpdateStatement(object, tableName)};
// }

// function getReturningColumn() {
//   return \`RETURNING
//   ${getColumn1(object)}\`;
// }

// function getFirstRowOfRes(res) {
//   if (!res) return null;

//   if (res?.rows[0]) {
//     return res.rows[0];
//   }
//   return null;
// }
// `;
// }
// function getColumnNames(object) {
//   let result = '';
//   for (let key in object) {
//     result += `${key}: \`"${object[key]}"\`,`;
//   }
//   return result;
//   //   return `id: \`"PRODUCT_ID"\`,
//   //     external_id: \`"PRODUCT_EXTERNAL_ID"\`,
//   //     name: \`"PRODUCT_NAME"\`,
//   //     desc: \`"PRODUCT_DESC"\`,
//   //     brand_color: \`"PRODUCT_BRAND_COLOR"\`,
//   //     brand_thumb_url: \`"PRODUCT_BRAND_THUMB_URL"\`,`;
// }
// function getColumnNameAliases(object) {
//   let result = '';
//   for (let key in object) {
//     result += `${key}: \`"${key}"\`,`;
//   }
//   return result;
//   //   return `id: \`"PRODUCT_ID"\`,
//   //     external_id: \`"PRODUCT_EXTERNAL_ID"\`,
//   //     name: \`"PRODUCT_NAME"\`,
//   //     desc: \`"PRODUCT_DESC"\`,
//   //     brand_color: \`"PRODUCT_BRAND_COLOR"\`,
//   //     brand_thumb_url: \`"PRODUCT_BRAND_THUMB_URL"\`,`;
// }

// function getKeys(object) {
//   return Object.keys(object).join(',');
// }

// function getColumn1(object) {
//   let result = '';
//   for (let key in object) {
//     result += `
//         \${columnName.${key}} as \${columnNameAlias.${key}},`;
//   }
//   return result.slice(0, -1);
//   // `\${columnName.id} as \${columnNameAlias.id},
//   // \${columnName.external_id} as \${columnNameAlias.external_id},
//   // \${columnName.name} as \${columnNameAlias.name},
//   // \${columnName.desc} as \${columnNameAlias.desc},
//   // \${columnName.brand_color} as \${columnNameAlias.brand_color},
//   // \${columnName.brand_thumb_url} as \${columnNameAlias.brand_thumb_url}`
// }
// function getCreateStatement(object, tableName) {
//   let result1 = '';
//   for (let key in object) {
//     result1 += `\${columnName.${key}},`;
//   }

//   result1 = stringWithNoLastKeyword(result1);

//   let result2 = '';
//   for (let i = 1; i <= Object.keys(object).length; i++) {
//     result2 += `\$${i},`;
//   }
//   result2 = stringWithNoLastKeyword(result2);

//   return `\`INSERT INTO \${${tableName}}(
//         ${result1})
//         VALUES (${result2})
//         \${getReturningColumn()};\``;
// }

// function stringWithNoLastKeyword(string) {
//   return string.slice(0, -1);
// }

// function getUpdateStatement(object, tableName) {
//   let result = '';
//   let n = 1;
//   for (let key in object) {
//     if (key !== 'id') {
//       result += `\${columnName.${key}} = $${n},`;
//       n++;
//     }
//   }

//   result = stringWithNoLastKeyword(result);

//   return `\`UPDATE \${${tableName}}
//     SET ${result}
//     WHERE  \${columnName.id} = \$${n}\``;
// }

// function getValueForCreateStatement(object) {
//   let result = '';

//   for (let key in object) {
//     if (key !== 'id') {
//       result += `${key} ? ${key} : existItem.${key},`;
//     }
//   }
//   return result;
// }

// function getValueForUpdateStatement(object) {
//   let result = '';

//   for (let key in object) {
//     if (key !== 'id') {
//       result += `${key} ?? "" ,`;
//     }
//   }
//   return result;
// }

// const orderObject = {
//   id: 'ORDER_ID',
//   name: 'ORDER_NAME',
//   planId: 'PLAN_ID',
//   planVerId: 'PLAN_VER_ID',
//   customerId: 'CUSTOMER_ID',
//   externalId: 'ORDER_EXTERNAL_ID',
//   status: 'ORDER_STATUS',
//   price: 'ORDER_PRICE',
//   archived: 'ORDER_ARCHIVED',
//   createdTs: 'ORDER_CREATED_TS',
//   lastUpdateTs: 'ORDER_LASTUPDATE_TS',
// };

// const brokerObject = {
//   id: 'B_ID',
//   name: 'B_NAME',
//   website: 'B_WEBSITE',
//   logo: 'B_LOGO',
// };

// console.log(generateScript('PT_BROKER', brokerObject));
