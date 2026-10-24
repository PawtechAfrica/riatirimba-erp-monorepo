/**
 * Downloads a given Blob as a file with the specified filename.
 *
 * @param blob - The Blob data to download (e.g., from Axios response or fetch).
 * @param filename - The name (including extension) to save the file as.
 * @returns void
 *
 * Example:
 *   const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
 *   downloadBlob(pdfBlob, 'report.pdf');
 */
export function downloadBlob(blob: Blob, filename: string): void {
    // Create a temporary object URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a hidden anchor element
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";

    // Append it, trigger click, and remove
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up memory
    window.URL.revokeObjectURL(url);
}
