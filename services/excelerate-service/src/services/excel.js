
const xlsx = require("xlsx");

async function importExcel(filePath) {
  const workbook = xlsx.readFile(filePath);

  const data = {};
  workbook.SheetNames.forEach((sheetName) => {
    const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" }); 
    data[sheetName] = rows;
  });

  return data; 
}

module.exports = { importExcel };
