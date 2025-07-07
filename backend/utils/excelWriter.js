const fs = require('fs');
const XLSX = require('xlsx');

const writeToExcel = (data, filePath = 'contacts.xlsx') => {
  let workbook;
  let worksheet;

  if (fs.existsSync(filePath)) {
    // File exists → Read existing and append new data
    workbook = XLSX.readFile(filePath);
    worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const existingData = XLSX.utils.sheet_to_json(worksheet);
    data = [...existingData, data]; // merge existing + new
  } else {
    // File doesn't exist → start fresh
    workbook = XLSX.utils.book_new();
    data = [data]; // wrap single object in array
  }

  const newSheet = XLSX.utils.json_to_sheet(data);
  workbook.SheetNames.length = 0; // remove old sheets (if any)
  XLSX.utils.book_append_sheet(workbook, newSheet, 'Contacts');

  try {
    XLSX.writeFile(workbook, filePath);
    console.log("✅ Excel file written:", filePath);
  } catch (err) {
    console.error("❌ Failed to write Excel file:", err);
  }
};

module.exports = writeToExcel;
