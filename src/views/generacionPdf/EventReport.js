import React from 'react';
import PropTypes from 'prop-types';
import { Document, Page, Text, View, PDFDownloadLink } from '@react-pdf/renderer';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(); // Formatea la fecha a un formato legible local
};

const MyDocument = ({ events }) => {
  const eventsChunks = [];
  for (let i = 0; i < events.length; i += 4) {
    eventsChunks.push(events.slice(i, i + 4)); // Divide los eventos en grupos de tres
  }

  return (
    <Document>
      {eventsChunks.map((chunk, pageIndex) => (
        <Page key={pageIndex} size="A4">
          <View style={{ flexDirection: 'column', paddingHorizontal: 20 }}>
            {chunk.map((event, index) => (
              <View key={index} style={{ marginBottom: 20, padding: 10, border: 1 }}>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>{`Agenda #${index + 1 + pageIndex * 3}`}</Text>
                </View>
                <View style={{ marginTop: 5 }}>
                  <Text>{`Título: ${event.title}`}</Text>
                  <Text>{`Fecha de inicio: ${formatDate(event.start)}`}</Text>
                  <Text>{`Fecha de fin: ${event.end ? formatDate(event.end) : 'No hay fecha de fin'}`}</Text>
                  <Text>{`Hora de inicio: ${event.horaInicio}`}</Text>
                  <Text>{`Hora de fin: ${event.horaFin}`}</Text>
                  <Text>{`Empleado: ${event.empleado}`}</Text>
                </View>
              </View>
            ))}
          </View>
        </Page>
      ))}
    </Document>
  );
};

MyDocument.propTypes = {
  events: PropTypes.array.isRequired,
};

const EventReport = ({ events }) => (
  <PDFDownloadLink document={<MyDocument events={events} />} fileName="reporte_eventos.pdf">
    {({ loading }) => (
      <div style={{ textAlign: 'right' }}> {/* Alineación a la derecha */}
        <div 
          style={{
            backgroundColor: 'black',
            borderRadius: '8px',
            color: 'white',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => { e.target.style.backgroundColor = 'black'; }} // Cambia el color al pasar el mouse
          onMouseLeave={(e) => { e.target.style.backgroundColor = '#3c4b64'; }} // Restaura el color al retirar el mouse
        >
          <span style={{ padding: '10px 30px', minWidth: '100px', height: '38px', display: 'flex', alignItems: 'center' }}>
            {loading ? 'Cargando...' : 'Descargar PDF'}
          </span>
        </div>
      </div>
    )}
  </PDFDownloadLink>
);




EventReport.propTypes = {
  events: PropTypes.array.isRequired,
};

export default EventReport;
