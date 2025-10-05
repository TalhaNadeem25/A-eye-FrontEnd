// Export utilities for CSV and PDF generation

export interface ExportData {
  [key: string]: string | number | boolean;
}

interface CameraData {
  id: string;
  name: string;
  location: string;
  ipAddress: string;
  port: number;
  isOnline: boolean;
  hasAlert: boolean;
  alertLevel: 'low' | 'medium' | 'high';
  lastSeen: Date;
  resolution: string;
  fps: number;
  recording: boolean;
  motionDetection: boolean;
  nightVision: boolean;
  audioEnabled: boolean;
}

interface AlertData {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: Date;
  type: string;
  severity: string;
  confidence: number;
  description: string;
  status: string;
  location: string;
  duration: number;
  assignedTo?: string;
  notes?: string;
}

export const exportToCSV = (data: ExportData[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (data: ExportData[], filename: string, title: string) => {
  // Simple PDF generation using browser's print functionality
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table>
        <thead>
          <tr>
            ${Object.keys(data[0] || {}).map(key => `<th>${key}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => 
            `<tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>`
          ).join('')}
        </tbody>
      </table>
      <div class="footer">
        <p>Total records: ${data.length}</p>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};

export const exportCamerasToCSV = (cameras: CameraData[]) => {
  const csvData = cameras.map(camera => ({
    'Camera ID': camera.id,
    'Name': camera.name,
    'Location': camera.location,
    'IP Address': camera.ipAddress,
    'Port': camera.port,
    'Status': camera.isOnline ? 'Online' : 'Offline',
    'Alert Status': camera.hasAlert ? 'Alert' : 'Normal',
    'Alert Level': camera.alertLevel,
    'Last Seen': camera.lastSeen.toLocaleString(),
    'Resolution': camera.resolution,
    'FPS': camera.fps,
    'Recording': camera.recording ? 'Yes' : 'No',
    'Motion Detection': camera.motionDetection ? 'Yes' : 'No',
    'Night Vision': camera.nightVision ? 'Yes' : 'No',
    'Audio Enabled': camera.audioEnabled ? 'Yes' : 'No'
  }));

  exportToCSV(csvData, `cameras-export-${new Date().toISOString().split('T')[0]}`);
};

export const exportAlertsToCSV = (alerts: AlertData[]) => {
  const csvData = alerts.map(alert => ({
    'Alert ID': alert.id,
    'Camera ID': alert.cameraId,
    'Camera Name': alert.cameraName,
    'Timestamp': alert.timestamp.toLocaleString(),
    'Type': alert.type,
    'Severity': alert.severity,
    'Confidence': `${alert.confidence}%`,
    'Description': alert.description,
    'Status': alert.status,
    'Location': alert.location,
    'Duration': `${alert.duration}s`,
    'Assigned To': alert.assignedTo || 'Unassigned',
    'Tags': alert.tags.join('; '),
    'Notes': alert.notes || ''
  }));

  exportToCSV(csvData, `alerts-export-${new Date().toISOString().split('T')[0]}`);
};

export const exportCamerasToPDF = (cameras: CameraData[]) => {
  const pdfData = cameras.map(camera => ({
    'Camera ID': camera.id,
    'Name': camera.name,
    'Location': camera.location,
    'IP Address': camera.ipAddress,
    'Status': camera.isOnline ? 'Online' : 'Offline',
    'Alert Status': camera.hasAlert ? 'Alert' : 'Normal',
    'Last Seen': camera.lastSeen.toLocaleString(),
    'Resolution': camera.resolution,
    'FPS': camera.fps
  }));

  exportToPDF(pdfData, `cameras-export-${new Date().toISOString().split('T')[0]}`, 'Camera Management Report');
};

export const exportAlertsToPDF = (alerts: AlertData[]) => {
  const pdfData = alerts.map(alert => ({
    'Alert ID': alert.id,
    'Camera': alert.cameraName,
    'Timestamp': alert.timestamp.toLocaleString(),
    'Type': alert.type,
    'Severity': alert.severity,
    'Confidence': `${alert.confidence}%`,
    'Description': alert.description,
    'Status': alert.status,
    'Location': alert.location,
    'Duration': `${alert.duration}s`
  }));

  exportToPDF(pdfData, `alerts-export-${new Date().toISOString().split('T')[0]}`, 'Security Alerts Report');
};
