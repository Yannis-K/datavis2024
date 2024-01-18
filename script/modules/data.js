import { DATA } from "../const.js";

export function getAllDataFromCSV(csvFilePath) {
  return axios
    .get(csvFilePath)
    .then((response) => {
      const csvData = response.data;

      const rows = csvData.split("\n");
      const header = rows[0].split(",");

      // console.log("***HEADER", header);

      let counter = 0;

      const data = rows.slice(1).map((row) => {
        // Use a regular expression to handle quoted fields with commas
        const columns = row.match(/(?:[^,"]|"(?:\\.|[^"])*")+/g);

        // Check if the number of columns matches the header length
        if (columns && columns.length === header.length) {
          const rowData = header.reduce((acc, key, columnIndex) => {
            acc[key.trim()] = columns[columnIndex]
              .trim()
              .replace(/^"(.*)"$/, "$1");
            return acc;
          }, {});

          // Log columns with the counter
          //console.log(`Row Counter ${++counter}:`, rowData);

          return rowData;
        } else {
          console.error(
            `Row has an incorrect number of columns or is not formatted correctly: ${row}`
          );
          return null; // or handle this case accordingly
        }
      });

      const filteredData = data.filter((item) => item !== null); // Remove entries with incorrect number of columns

      return filteredData;
    })
    .catch((error) => {
      console.error("Error fetching or parsing CSV data:", error);
      throw error; // Rethrow the error for further handling if needed
    });
}

export function getFilteredData(dataBefore, beginYear, endYear) {
  // Convertir les années de début et de fin en nombres
  const startYear = parseInt(beginYear, 10);
  const finishYear = parseInt(endYear, 10);

  // Valider les années d'entrée
  if (isNaN(startYear) || isNaN(finishYear) || startYear > finishYear) {
    console.error(
      "Années d'entrée non valides. Veuillez fournir des années valides."
    );
    return false;
  }

  // Filtrer les données en fonction de la plage d'années spécifiée
  const filteredData = dataBefore.filter((item) => {
    const itemYear = parseInt(item.year, 10);

    // Filtrer les éléments dans la plage d'années spécifiée
    return itemYear >= startYear && itemYear <= finishYear;
  });

  return filteredData;
}

// TODO : filter
export function applyFilter() {
  const startYear = document.getElementById("start-year").value;
  const endYear = document.getElementById("end-year").value;

  if (!startYear || !endYear) {
    alert("Veuillez remplir les deux champs de date.");
    return;
  }

  if (parseInt(endYear) < parseInt(startYear)) {
    alert("La date de fin doit être supérieure ou égale à la date de début.");
    return;
  }

  const filteredData = getFilteredData(DATA, startYear, endYear);
  //console.log(filteredData);

  return filteredData;
}
