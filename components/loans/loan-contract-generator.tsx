"use client"

import { useState } from "react"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import { Button } from "@/components/ui/button"
import { saveAs } from "file-saver"
import { formatCurrency } from "@/lib/utils"

interface ContractGeneratorProps {
  loanData: any
  userData: any
  motorcycleData: any
}

export function LoanContractGenerator({ loanData, userData, motorcycleData }: ContractGeneratorProps) {
  const [generating, setGenerating] = useState(false)

  const generateContract = async () => {
    try {
      setGenerating(true)

      // Crear un nuevo documento PDF
      const pdfDoc = await PDFDocument.create()

      // Agregar una página al documento
      const page = pdfDoc.addPage([595.28, 841.89]) // Tamaño A4

      // Obtener la fuente estándar
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      // Configurar propiedades de texto
      const fontSize = 12
      const lineHeight = 20
      let y = 800 // Posición inicial desde arriba

      // Función para agregar texto
      const addText = (text: string, font = helveticaFont, size = fontSize, indent = 0) => {
        page.drawText(text, {
          x: 50 + indent,
          y,
          size,
          font,
          color: rgb(0, 0, 0),
        })
        y -= lineHeight
      }

      // Función para agregar espacio
      const addSpace = (lines = 1) => {
        y -= lineHeight * lines
      }

      // Título del contrato
      addText("CONTRATO DE FINANCIAMIENTO DE MOTOCICLETA", helveticaBold, 16)
      addSpace()

      // Fecha del contrato
      const currentDate = new Date().toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      addText(`Fecha: ${currentDate}`, helveticaFont, 12)
      addSpace()

      // Información de las partes
      addText("PARTES DEL CONTRATO:", helveticaBold, 14)
      addSpace(0.5)

      addText("ACREEDOR:", helveticaBold)
      addText("Nombre de la Empresa: MOTO FINANCIERA S.A.S", helveticaFont, 12, 20)
      addText("NIT: 900.123.456-7", helveticaFont, 12, 20)
      addText("Dirección: Calle Principal #123, Ciudad", helveticaFont, 12, 20)
      addText("Teléfono: (601) 123-4567", helveticaFont, 12, 20)
      addSpace()

      addText("DEUDOR:", helveticaBold)
      addText(`Nombre: ${userData.name}`, helveticaFont, 12, 20)
      addText(`Identificación: ${userData.identification || "N/A"}`, helveticaFont, 12, 20)
      addText(`Dirección: ${userData.address || "N/A"}`, helveticaFont, 12, 20)
      addText(`Teléfono: ${userData.phone || "N/A"}`, helveticaFont, 12, 20)
      addText(`Email: ${userData.email || "N/A"}`, helveticaFont, 12, 20)
      addSpace()

      // Información de la motocicleta
      addText("INFORMACIÓN DE LA MOTOCICLETA:", helveticaBold, 14)
      addSpace(0.5)
      addText(`Marca: ${motorcycleData.brand}`, helveticaFont, 12, 20)
      addText(`Modelo: ${motorcycleData.model}`, helveticaFont, 12, 20)
      addText(`Año: ${motorcycleData.year || "N/A"}`, helveticaFont, 12, 20)
      addText(`Placa: ${motorcycleData.plate}`, helveticaFont, 12, 20)
      addText(`Número de Chasis: ${motorcycleData.chassisNumber || "N/A"}`, helveticaFont, 12, 20)
      addText(`Número de Motor: ${motorcycleData.engineNumber || "N/A"}`, helveticaFont, 12, 20)
      addText(`Color: ${motorcycleData.color || "N/A"}`, helveticaFont, 12, 20)
      addSpace()

      // Términos del préstamo
      addText("TÉRMINOS DEL FINANCIAMIENTO:", helveticaBold, 14)
      addSpace(0.5)
      addText(`Precio Total de la Motocicleta: ${formatCurrency(loanData.totalAmount)}`, helveticaFont, 12, 20)
      addText(`Pago Inicial: ${formatCurrency(loanData.downPayment)}`, helveticaFont, 12, 20)
      addText(`Monto Financiado: ${formatCurrency(loanData.financedAmount)}`, helveticaFont, 12, 20)
      addText(`Tasa de Interés Anual: ${loanData.interestRate}%`, helveticaFont, 12, 20)
      addText(`Tipo de Interés: ${loanData.interestType === "FIXED" ? "Fijo" : "Compuesto"}`, helveticaFont, 12, 20)
      addText(`Número de Cuotas: ${loanData.installments}`, helveticaFont, 12, 20)
      addText(
        `Frecuencia de Pago: ${
          loanData.paymentFrequency === "MONTHLY"
            ? "Mensual"
            : loanData.paymentFrequency === "BIWEEKLY"
              ? "Quincenal"
              : "Semanal"
        }`,
        helveticaFont,
        12,
        20,
      )
      addText(`Valor de la Cuota: ${formatCurrency(loanData.monthlyPayment)}`, helveticaFont, 12, 20)
      addText(`Monto Total a Pagar: ${formatCurrency(loanData.totalWithInterest)}`, helveticaFont, 12, 20)
      addSpace()

      // Cláusulas del contrato
      addText("CLÁUSULAS DEL CONTRATO:", helveticaBold, 14)
      addSpace(0.5)

      addText("PRIMERA - OBJETO:", helveticaBold, 12, 20)
      addText(
        "El ACREEDOR otorga al DEUDOR un préstamo para la adquisición de la motocicleta descrita",
        helveticaFont,
        12,
        40,
      )
      addText(
        "anteriormente, y el DEUDOR se compromete a pagar dicho préstamo en los términos y",
        helveticaFont,
        12,
        40,
      )
      addText("condiciones establecidos en este contrato.", helveticaFont, 12, 40)
      addSpace()

      addText("SEGUNDA - GARANTÍA:", helveticaBold, 12, 20)
      addText(
        "La motocicleta objeto de este contrato queda en prenda a favor del ACREEDOR hasta el",
        helveticaFont,
        12,
        40,
      )
      addText(
        "pago total del préstamo. El DEUDOR no podrá vender, transferir o gravar la motocicleta",
        helveticaFont,
        12,
        40,
      )
      addText("sin autorización escrita del ACREEDOR.", helveticaFont, 12, 40)
      addSpace()

      addText("TERCERA - INCUMPLIMIENTO:", helveticaBold, 12, 20)
      addText(
        "En caso de incumplimiento en el pago de tres (3) cuotas consecutivas, el ACREEDOR",
        helveticaFont,
        12,
        40,
      )
      addText(
        "podrá declarar vencido el plazo y exigir el pago total de la deuda, incluyendo intereses",
        helveticaFont,
        12,
        40,
      )
      addText("moratorios a la tasa máxima legal permitida.", helveticaFont, 12, 40)
      addSpace()

      // Agregar una nueva página para firmas
      const signaturesPage = pdfDoc.addPage([595.28, 841.89])
      y = 800

      // Función para agregar texto en la nueva página
      const addTextToSignaturesPage = (text: string, font = helveticaFont, size = fontSize, indent = 0) => {
        signaturesPage.drawText(text, {
          x: 50 + indent,
          y,
          size,
          font,
          color: rgb(0, 0, 0),
        })
        y -= lineHeight
      }

      addTextToSignaturesPage("CUARTA - SEGUROS:", helveticaBold, 12, 20)
      addTextToSignaturesPage(
        "El DEUDOR se obliga a mantener la motocicleta asegurada contra todo riesgo durante",
        helveticaFont,
        12,
        40,
      )
      addTextToSignaturesPage(
        "la vigencia del préstamo, designando al ACREEDOR como beneficiario de la póliza.",
        helveticaFont,
        12,
        40,
      )
      addSpace()

      addTextToSignaturesPage("QUINTA - PAGOS ANTICIPADOS:", helveticaBold, 12, 20)
      addTextToSignaturesPage(
        "El DEUDOR podrá realizar pagos anticipados totales o parciales sin penalidad alguna.",
        helveticaFont,
        12,
        40,
      )
      addTextToSignaturesPage(
        "Los pagos parciales se aplicarán primero a intereses y luego a capital.",
        helveticaFont,
        12,
        40,
      )
      addSpace(2)

      // Espacio para firmas
      addTextToSignaturesPage(
        "En constancia de aceptación, las partes firman este contrato en dos ejemplares del mismo",
        helveticaFont,
        12,
      )
      addTextToSignaturesPage("tenor, en la ciudad de ________________, el día " + currentDate + ".", helveticaFont, 12)
      addSpace(3)

      // Líneas para firmas
      y = y - 20
      signaturesPage.drawLine({
        start: { x: 100, y },
        end: { x: 250, y },
        thickness: 1,
        color: rgb(0, 0, 0),
      })

      y = y - 10
      addTextToSignaturesPage("EL ACREEDOR", helveticaFont, 12, 50)
      addTextToSignaturesPage("MOTO FINANCIERA S.A.S", helveticaFont, 12, 50)
      addTextToSignaturesPage("NIT: 900.123.456-7", helveticaFont, 12, 50)

      y = y - 40
      signaturesPage.drawLine({
        start: { x: 350, y: y + 50 },
        end: { x: 500, y: y + 50 },
        thickness: 1,
        color: rgb(0, 0, 0),
      })

      addTextToSignaturesPage("EL DEUDOR", helveticaFont, 12, 350)
      addTextToSignaturesPage(`${userData.name}`, helveticaFont, 12, 350)
      addTextToSignaturesPage(`C.C. ${userData.identification || "N/A"}`, helveticaFont, 12, 350)

      // Serializar el documento a bytes
      const pdfBytes = await pdfDoc.save()

      // Crear un blob con los bytes del PDF
      const blob = new Blob([pdfBytes], { type: "application/pdf" })

      // Descargar el archivo
      saveAs(
        blob,
        `Contrato_Prestamo_${userData.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`,
      )
    } catch (error) {
      console.error("Error al generar el contrato:", error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Button onClick={generateContract} disabled={generating} className="w-full">
      {generating ? "Generando contrato..." : "Generar contrato PDF"}
    </Button>
  )
}
