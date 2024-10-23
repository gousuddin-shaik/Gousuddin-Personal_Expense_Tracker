const express = require("express");
const path = require('path');
const {open} = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json())
const dbPath = path.join(__dirname,'PersonalExpenseTracker.db');
let db = null;

initializeDbAndServer = async () => {
  try{
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    app.listen(3000,() => {
      console.log("Server Running at http://localhost:3000");
    });
  }
  catch(e){
    console.log(`DB Error ${e.message}`);
    process.exit(1);
  }
}
initializeDbAndServer();

app.post('/transactions', async (request,response) => {
  const {id, type, category, amount, date, description} = request.body;
  const insertTransactionQuery = `
  INSERT INTO transactions
  (id, type, category, amount, date, description)
  VALUES
  (${id},'${type}',${category},${amount},'${date}','${description}');
  `
  console.log(insertTransactionQuery);
  await db.run(insertTransactionQuery);
  response.send('Successfully updated');
});

app.get('/transactions', async (request,response) => {
  const getTransactionsQuert = `
  SELECT * FROM transactions;
  `
  dbResponse = await db.all(getTransactionsQuert);
  response.send(dbResponse);
})

app.get('/transactions/:id', async (request,response) => {
  const {id} = request.params;
  const getQuery = `
  SELECT * FROM transactions where id = ${id};
  `
  dbResponse = await db.get(getQuery);
  response.send(dbResponse);
})

app.put('/transactions/:id', async (request,response) => {
  const {id} = request.params;
  const {type, category, amount, date, description} = request.body;
  const updateQuery = `
  UPDATE transactions
  SET 
  id = ${id},
  type = '${type}',
  category = ${category},
  amount = ${amount},
  date = '${date}',
  description = '${description}'
  WHERE id = ${id};
  `
  await db.run(updateQuery);
  response.send('Query Successfully Updated');
})

app.delete('/transactions/:id', async (request,response) => {
  const {id} = request.params;
  const deleteQuery = `DELETE FROM transactions where id = ${id};`
  await db.get(deleteQuery);
  response.send('Query Deleted Successfully');
})

app.get('/summary', async (request,response) => {
  const summaryQuery = `
  SELECT 
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expenses,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS balance
  FROM transactions;
  `
  const dbResponse = await db.get(summaryQuery);
  response.send(dbResponse);
})