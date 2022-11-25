export default function (tableName, object) {
  return `const { Pool } = require("pg");

const pool = new Pool({
    user: "postgres",
    host: "alephon-shared-dev-pg.cluster-caxbihou6kbt.ap-southeast-1.rds.amazonaws.com",
    database: "PT",
    password: "s~&?1_SApRnBDx[r",
    port: 5432,
});

const ${tableName}=\`"${tableName}"\`

exports.handler = async (event, context, callback) => {

    const client = await pool.connect();
    let deleteIdArray = event;
 
    try {

        // Delete items
        await client.query('BEGIN');
        const result = await client.query(deleteMulti(${tableName},deleteIdArray.length),deleteIdArray);
        await client.query('COMMIT');

        // Get ID of deleted items
        let deletedItems = result.rows;
        let deletedItemsId=[];

        deletedItems.forEach((item) => {
            deletedItemsId.push(item.${object.id});
        });

        if (deletedItemsId.length==0){
            return response(404, false, ["Item not found"]);
        }
        return response(200, true, deletedItems);
    } catch (err) {
        await client.query('ROLLBACK')
        throw err;
    } finally {
        client.release()
    }

};

function deleteMulti(table, arrayItemIdSize){
    
    let listId=\`\`;
    for (let i = 1; i <= arrayItemIdSize; i++) {
        listId += \` \$\${i},\`;
    };
    listId=listId.substring(0, listId.length - 1);
    let deleteQuery =   \`DELETE FROM \${table} WHERE "${object.id}" IN (\${listId} ) RETURNING *;\`;

    return deleteQuery;

}

function response(code, success, data){
    return {
        code, 
        success,
        data
    }
}`;
}
