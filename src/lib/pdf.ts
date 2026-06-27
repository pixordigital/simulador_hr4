import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export async function exportarPDF(el: HTMLElement, filename: string) {
  const canvas = await html2canvas(el, {
    scale: 2,
    backgroundColor: '#F5F5F4',
    logging: false,
    useCORS: true,
  })
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const imgWidth = pageWidth - 20
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let heightLeft = imgHeight
  let position = 10

  pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
  heightLeft -= pdf.internal.pageSize.getHeight() - 20

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + 10
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
    heightLeft -= pdf.internal.pageSize.getHeight() - 20
  }

  pdf.save(filename)
}
