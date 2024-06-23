import axios from "axios";
import cheerio from "cheerio";

async function fetchResult(rollNo: string) {
  console.log(`Fetching result for rollNo: ${rollNo}`);

  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `http://results.ietdavv.edu.in/DisplayStudentResult?rollno=${rollNo}&typeOfStudent=Regular`,
    headers: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "Accept-Language": "en-IN,en;q=0.9",
      "Cache-Control": "max-age=0",
      Connection: "keep-alive",
      Cookie: "JSESSIONID=005A364B1EDE16FC4C5952496942A374",
      Referer: "http://results.ietdavv.edu.in/",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
    },
  };

  try {
    const response = await axios.request(config);
    const { studentName, sgpa, result } = parseHtml(response.data);
    if (sgpa !== "N/A") {
      return { rollNo, studentName, sgpa, result };
    } else {
      return null; // Return null for rows where SGPA is "N/A"
    }
  } catch (error) {
    console.error(`Error fetching result for rollNo: ${rollNo}`, error);
    return { rollNo, studentName: "N/A", sgpa: "N/A", result: "Failed" };
  }
}

function parseHtml(htmlContent: string) {
  const $ = cheerio.load(htmlContent);
  const studentNameElement = $("td:contains('Student Name')").next();
  const studentName = studentNameElement.text().trim() || "N/A";
  const sgpaElement = $("td:contains('SGPA')").next();
  const sgpa = sgpaElement.text().trim() || "N/A";
  const resultElement = $("td:contains('Result')").next();
  const result = resultElement.text().trim() || "N/A";
  return { studentName, sgpa, result };
}

async function fetchAllSGPAs(startRollNo: number, endRollNo: number) {
  const tableData = [];

  for (let i = startRollNo; i <= endRollNo; i++) {
    const rollNo = `21T51${i.toString().padStart(2, "0")}`;
    const data = await fetchResult(rollNo);
    if (data) {
      tableData.push(data);
    }
  }

  // Print the table header with fixed column widths
  console.log("Roll No\tStudent Name\t\tSGPA\tResult");

  // Print each row of the table with fixed column widths
  tableData.forEach(({ rollNo, studentName, sgpa, result }) => {
    console.log(`${rollNo}\t${padRight(studentName, 20)}\t${padRight(sgpa, 6)}\t${result}`);
  });
}

// Helper function to pad strings to a fixed width (right-aligned)
function padRight(str: string, width: number) {
  const len = Math.max(0, width - str.length);
  return str + " ".repeat(len);
}

// Example usage:
fetchAllSGPAs(1, 99); // Fetches SGPA for roll numbers 21T5172 to 21T5173
