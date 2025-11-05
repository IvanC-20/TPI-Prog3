import { createObjectCsvWriter } from "csv-writer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class InformesServicio{
    async csv_InformeIngresosSalon(datosReporte) {
        try {
            let ruta = path.resolve(__dirname, '../utils');
            ruta = path.join(ruta, 'ingresos_por_salon.csv');

             const csvWriter = createObjectCsvWriter({
                path: ruta,
                header: [
                    { id: 'salon', title: 'Salón' },
                    { id: 'total_ingresos', title: 'Ingresos Totales' }
                ]
            });

            await csvWriter.writeRecords(datosReporte);
            return ruta;

        } catch (error) {
            console.error(`Error generando CSV: ${error}`);
            throw error;
        }

        }
    }


