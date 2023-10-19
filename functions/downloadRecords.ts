const sasUrl = "https://stravafunctionappautorek.blob.core.windows.net/records/records.json?sp=r&st=2023-10-19T13:12:54Z&se=2024-12-31T22:12:54Z&sv=2022-11-02&sr=b&sig=pb9bc7eLKV7FQVzunHvzZWabei5q5I0jGzC3%2FJILQNw%3D"

export default async function downloadRecords() {
  try {
    const response = await fetch(sasUrl);

    if (response.ok) {
      const jsonText = await response.text();
      const jsonArray = JSON.parse(jsonText);
      return jsonArray;
    } else {
      console.error('Error fetching records:', response.statusText);
      return null; // Handle the error as needed
    }
  } catch (error) {
    console.error('An error occurred:', error);
    return null; // Handle the error as needed
  }
}

