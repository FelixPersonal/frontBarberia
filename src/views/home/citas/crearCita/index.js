import React, { useState, useEffect } from "react";
import {
  CContainer,
  CCard,
  CCardBody,
  CCardTitle,
  CRow,
  CCol,
  CButton,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CAlert,
  CCardText,
} from "@coreui/react";
import Servicios_S from "src/views/services/servicios_s";
import ServicioBarbero from "src/views/services/empleado_agenda";
import { format, isAfter, isSameDay, isBefore } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid"; // a plugin!
import interactionPlugin from "@fullcalendar/interaction"; // for selectable
import CitasDataService from "src/views/services/citasService";
import 'src/scss/css/calendarStyles.css';
import 'src/scss/css/global.css';
import CitasServiciosDataService from "src/views/services/citasServiciosService";
import Swal from 'sweetalert2'
import { getUserInfo } from '../../../../components/auht';




const getHorasOcupadas = async (id_usuario) => {
  try {
    const response = await CitasDataService.getAllCitasServicios(id_usuario);
    const citas = response.data.citas;

    const horasOcupadas = citas.reduce((acc, cita) => {
      const inicio = new Date(cita.Fecha_Atencion + 'T' + cita.Hora_Atencion);
      const fin = new Date(cita.Fecha_Atencion + 'T' + cita.Hora_Fin);
      const current = new Date(inicio);
      while (current < fin) {
        acc.push(format(current, "HH:mm"));
        current.setMinutes(current.getMinutes() + 60);
      }
      return acc;
    }, []);

    return horasOcupadas;
  } catch (error) {
    console.error("Error al obtener las citas del usuario:", error);
    return [];
  }
};





const AgendarCita = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleLg, setVisibleLg] = useState(false);
  const [showAgendarButton, setShowAgendarButton] = useState(currentPage !== 3);
  const [servicesData, setServicesData] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [tempSelectedServices, setTempSelectedServices] = useState([]);
  const [barberoId, setBarberoId] = useState(null);
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [selectedBarbero, setSelectedBarbero] = useState(null);
  const [selectedBarberoId, setSelectedBarberoId] = useState(null);
  const [agendaData, setAgendaData] = useState([]);
  const [citasAgendadas, setCitasAgendadas] = useState([]);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedBarberoName, setSelectedBarberoName] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);

  const [modalHoraVisible, setModalHoraVisible] = useState(false);
  // const [citasAgendadas, setCitasAgendadasData] = useState([]);

  const [selectedServicesDuration, setSelectedServicesDuration] = useState(0);
  const [selectedHourFin, setSelectedHourFin] = useState(null);
  const [options, setOptions] = useState([]);




  useEffect(() => {
    const fetchData = async () => {
      try {

        const servicesResponse = await Servicios_S.getAll();
        setServicesData(servicesResponse.data.listServicios);

        const empleadosResponse = await ServicioBarbero.getAll();
        const nestedArray =
          empleadosResponse.data && empleadosResponse.data.empleados;

        if (Array.isArray(nestedArray)) {
          setEmpleados(nestedArray);
        } else {
          console.error(
            "Error: La respuesta no contiene un array de proveedores",
            empleadosResponse.data,
          );
        }
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    calculateAppointmentTime();
  }, [selectedHour, selectedServicesDuration]);



  useEffect(() => {
    const fetchHorasOcupadas = async () => {
      const userInfo = await getUserInfo();
      if (userInfo.userId) {
        const ocupadas = await getHorasOcupadas(userInfo.userId);
        setHorasOcupadas(ocupadas);
      }
    };
    fetchHorasOcupadas();
  }, []);

  const handleDateSelect = (info) => {
    const date = info.start;
    const formattedDate = format(date, "yyyy-MM-dd");
    console.log("Fecha seleccionada:", formattedDate);
    console.log("Fecha original:", date);

    // Establecer la fecha seleccionada correctamente
    setSelectedDate(formattedDate);

    // Obtener la lista de todos los elementos del calendario
    const calendarDayElements = document.querySelectorAll('.fc-day');

    // Iterar sobre los elementos del calendario para encontrar el elemento correspondiente a la fecha seleccionada
    calendarDayElements.forEach((dayElement) => {
      // Obtener la fecha asociada a este elemento del calendario
      const dayDateString = dayElement.getAttribute('data-date');

      // Verificar si esta fecha coincide con la fecha seleccionada
      if (dayDateString === formattedDate) {
        // Marcar el elemento del calendario como seleccionado cambiando su estilo
        dayElement.style.backgroundColor = '#e83d3d';

        // Restablecer el color de fondo del elemento después de un tiempo determinado (por ejemplo, 3 segundos)
        setTimeout(() => {
          dayElement.style.backgroundColor = ''; // Restablecer el color de fondo a su valor predeterminado
        }, 3000); // 3000 milisegundos = 3 segundos
      }
    });

    if (agendaData.length > 0) {
      const firstAgendaDate = format(new Date(agendaData[0].fechaInicio), "yyyy-MM-dd");

      // Validar si la fecha seleccionada está dentro del rango permitido
      const selectedDateObj = new Date(formattedDate);
      const firstAgendaDateObj = new Date(firstAgendaDate);

      if (isAfter(selectedDateObj, firstAgendaDateObj) || isSameDay(selectedDateObj, firstAgendaDateObj)) {
        const lastAgendaDate = format(new Date(agendaData[agendaData.length - 1].fechaFin), "yyyy-MM-dd");
        const lastAgendaDateObj = new Date(lastAgendaDate);

        if (isBefore(selectedDateObj, lastAgendaDateObj) || isSameDay(selectedDateObj, lastAgendaDateObj)) {
          setModalHoraVisible(true);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error al Seleccionar la Fecha",
            text: "La fecha seleccionada debe ser anterior o igual a la última fecha de finalización en la lista!",
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al Seleccionar la Fecha",
          text: "La fecha seleccionada debe ser igual o posterior a la primera fecha en la lista!",
        });
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No hay fechas disponibles en la lista!",
      });
    }
  };




  const createCitaServicio = async (idCita, serviciosSeleccionados) => {
    try {
      // Iterar sobre los servicios seleccionados
      for (const servicio of serviciosSeleccionados) {
        // Crear un objeto de cita de servicio
        const nuevaCitaServicio = {
          id_cita: idCita,
          id_servicio: servicio.id,
        };

        // Utilizar la función create de CitasServiciosDataService para crear la cita de servicio
        await CitasServiciosDataService.create(nuevaCitaServicio);
      }

      console.log("Citas de servicio creadas correctamente");
    } catch (error) {
      console.error("Error al crear las citas de servicio:", error);
      // Manejar el error según sea necesario
    }
  };


  // Función para calcular la duración entre dos horas en formato HH:mm
  const getIntervalDuration = (start, end) => {
    // Verificar si start o end son null antes de intentar dividirlos
    if (start === null || end === null) {
      // Manejar el caso en el que start o end son null
      console.error("Error: La hora de inicio o fin es nula (null)");
      return null; // Otra acción adecuada según el contexto
    }

    // Divide las cadenas de inicio y fin en horas y minutos, convirtiéndolos a números
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    // Calcula el total de minutos para la hora de inicio y fin
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Retorna la diferencia entre los minutos totales de la hora de fin y la hora de inicio
    return endTotalMinutes - startTotalMinutes;
  };

  const handleAcceptButtonClick = () => {
    setTempSelectedServices(selectedServices);
    setVisibleLg(false);
  };

  // Función para manejar la selección de un servicio
  const handleServiceSelection = (service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);

    // Guarda tanto el nombre como la duración del servicio seleccionado
    const selectedService = {
      id: service.id,
      nombre: service.nombre,
      valor: service.valor,
      tiempo: service.tiempo,
    };

    setSelectedServices((prevSelectedServices) =>
      isSelected
        ? prevSelectedServices.filter((s) => s.id !== service.id)
        : [...prevSelectedServices, selectedService]
    );

    // Actualiza la duración total de los servicios seleccionados
    setSelectedServicesDuration((prevDuration) =>
      isSelected
        ? prevDuration - parseInt(service.tiempo) // Resta la duración del servicio
        : prevDuration + parseInt(service.tiempo) // Suma la duración del servicio
    );

    // Llama a calculateAppointmentTime después de actualizar selectedServicesDuration
    calculateAppointmentTime();

    console.log("Servicio seleccionado:", selectedService);
  };

  // Función para sumar minutos a una hora dada
  const addMinutes = (time, minutes) => {
    if (time === null) {
      console.error("Error: La hora es nula (null)");
      return null;
    }

    const [hours, mins, seconds = "00"] = time.split(":").map(parseFloat);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;

    const formattedHours = newHours.toString().padStart(2, "0");
    const formattedMins = newMins.toString().padStart(2, "0");

    const result = `${formattedHours}:${formattedMins}:${seconds.toString().padStart(2, "0")}`;
    console.log("Hora de fin calculada en addMinutes:", result);
    return result;
  };


  useEffect(() => {
    const fetchCitasAgendadas = async () => {
      try {
        const response = await fetch('/api/citas');
        const data = await response.json();
        setCitasAgendadas(data);
      } catch (error) {
        console.error('Error al obtener las citas agendadas:', error);
      }
    };

    fetchCitasAgendadas();
  }, []);


  const calculateAppointmentTime = () => {
    if (selectedHour === null) {
      console.error("Error: La hora de inicio es nula (null)");
      return null;
    }

    const horaInicio = selectedHour;
    const horaFin = addMinutes(selectedHour, +selectedServicesDuration);

    if (horaFin === null) {
      console.error("Error: La hora de fin es nula (null)");
      return null;
    }

    const totalAppointmentTime = getIntervalDuration(horaInicio, horaFin);
    console.log("Total Appointment Time:", totalAppointmentTime);
    return totalAppointmentTime;
  };


  const handleBarberoSelection = async (id_empleado) => {
    setSelectedBarberoId(id_empleado);

    try {
      // Obtener las agendas del empleado seleccionado, ordenadas por fecha de inicio
      const response = await CitasDataService.getEmpleadoAgendas(id_empleado);
      console.log("Agendas del empleado:", response.data.agendas);
      let agendas = response.data.agendas;

      // Ordenar las agendas por fecha de inicio en orden ascendente
      agendas.sort((a, b) => new Date(a.fechaInicio) - new Date(b.fechaInicio));

      // Filtrar las agendas para mostrar solo los eventos con estado true
      const agendasEstadoTrue = agendas.filter((agenda) => agenda.estado === true);
      console.log('Agendas con estado true:', agendasEstadoTrue);

      // Obtener la fecha actual
      const currentDate = new Date();
      console.log("Fecha actual:", currentDate);

      // Filtrar las agendas para mostrar solo los eventos a partir de la fecha actual
      const agendasFuturas = agendasEstadoTrue.filter((agenda) => {
        const startDate = new Date(agenda.fechaInicio);
        // Comparar solo la fecha sin la hora (para incluir las agendas de hoy)
        const isFuture = startDate.setHours(0, 0, 0, 0) >= currentDate.setHours(0, 0, 0, 0);
        return isFuture;
      });
      console.log('Agendas futuras:', agendasFuturas);

      // Verificar si hay agendas futuras para el empleado seleccionado
      if (agendasFuturas.length > 0) {
        // Establecer el empleado seleccionado y sus agendas
        setSelectedBarbero(response.data.empleado);
        setAgendaData(agendasFuturas);

        // Llamar a calculateAppointmentTime después de haber establecido todos los datos necesarios, incluida la hora seleccionada
        calculateAppointmentTime();

        // Establecer el nombre del empleado seleccionado utilizando la respuesta del servidor
        setSelectedBarberoName(response.data.empleado.nombre);
      } else {
        // Si no hay agendas futuras, mostrar un mensaje de error con SweetAlert
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se encontraron agendas futuras para el empleado seleccionado.",
        });
      }
    } catch (error) {
      console.error("Error al obtener la agenda del empleado:", error);
    }

    // Incrementar el número de página después de manejar la selección del barbero
    handlePageChange(currentPage + 1);
  };

  const handlePageChange = (page) => {
    if (page === 2 && selectedServices.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Error al cambiar de página",
        text: "Debes seleccionar al menos un servicio antes de continuar",
      });
      return;
    }
    if (page === 3 && !selectedBarberoId) {
      Swal.fire({
        icon: "error",
        title: "Error al cambiar de página",
        text: "Debes seleccionar un barbero antes de continuar",
      });
      return;
    }
    setCurrentPage(page);
  };


  const isAfterOrEqual = (time1, time2) => {
    const date1 = new Date(`1970-01-01T${time1}`);
    const date2 = new Date(`1970-01-01T${time2}`);
    return date1.getTime() >= date2.getTime();
  };

  const isBeforeOrEqual = (time1, time2) => {
    const date1 = new Date(`1970-01-01T${time1}`);
    const date2 = new Date(`1970-01-01T${time2}`);
    return date1.getTime() <= date2.getTime();
  };


  const generateHourOptions = (startHour, endHour, selectedDate, horasOcupadas = []) => {
    const options = [];
    const start = parseInt(startHour.split(":")[0]); // Extract the start hour
    const end = parseInt(endHour.split(":")[0]); // Extract the end hour

    for (let hour = start; hour <= end; hour++) {
      for (let minute = 0; minute < 60; minute += 60) {
        const suffix = hour >= 12 ? "PM" : "AM";
        const formattedHora = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}:00`;

        // Check if the time is occupied by a scheduled appointment
        const horaOcupada = horasOcupadas.includes(formattedHora);

        // Calculate the end time of the appointment
        const horaFinCita = addMinutes(formattedHora, selectedServicesDuration);

        // Check if the time is within the available time range
        const horaDisponible = isAfterOrEqual(formattedHora, startHour) && isBeforeOrEqual(formattedHora, endHour);

        // After selecting a start time, calculate and display the available hours
        const handleClick = () => {
          if (horaDisponible && !horaOcupada) {
            setSelectedHour(formattedHora);
            setSelectedHourFin(horaFinCita);
            // Remove the selected hour and subsequent hours from the available options
            const remainingOptions = removeScheduledHourAndFollowingHours(formattedHora, options);
            // Update the available options
            setOptions(remainingOptions);
          }
        };

        options.push(
          <div key={formattedHora} style={{ padding: '1px' }}>
            <button
              disabled={!horaDisponible || horaOcupada}
              style={{
                backgroundColor: formattedHora === selectedHour ? '#AB1224' : (horaOcupada ? '#e83d3d' : '#447226'),
                color: '#fff',
                cursor: horaOcupada ? 'not-allowed' : 'pointer',
                borderRadius: '5px',
                width: '100%',
              }}
              onClick={handleClick}
            >
              {`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${suffix}`}
            </button>
          </div>
        );
      }
    }

    return options;
  };

  // UseEffect to handle options generation
  useEffect(() => {
    if (selectedBarberoId && selectedDate) {
      const opciones = generateHourOptions(
        agendaData[0].horaInicio,
        agendaData[0].horaFin,
        selectedDate,
        horasOcupadas
      );
      setOptions(opciones);
    }
  }, [selectedBarberoId, selectedDate, horasOcupadas, citasAgendadas]);




  // UseEffect to handle options generation
  useEffect(() => {
    if (selectedBarberoId && selectedDate) {
      const opciones = generateHourOptions(
        agendaData[0].horaInicio,
        agendaData[0].horaFin,
        selectedDate,
        horasOcupadas
      );
      setOptions(opciones);
    }
  }, [selectedBarberoId, selectedDate, horasOcupadas, citasAgendadas]);


  // UseEffect to handle options generation
  useEffect(() => {
    if (selectedBarberoId && selectedDate) {
      const opciones = generateHourOptions(
        agendaData[0].horaInicio,
        agendaData[0].horaFin,
        selectedDate,
        citasAgendadas
      );
      setOptions(opciones);
    }
  }, [selectedBarberoId, selectedDate, horasOcupadas, citasAgendadas]);

  const removeScheduledHourAndFollowingHours = (formattedHour, options) => {
    console.log("Hora agendada:", formattedHour);
    console.log("Opciones antes de eliminar la hora agendada:", options);

    const remainingOptions = options.filter(option => {
      const optionHour = option.key;
      return isAfterOrEqual(optionHour, formattedHour);
    });

    console.log("Opciones restantes después de eliminar la hora agendada:", remainingOptions);
    return remainingOptions;
  };


  const handleAgendarClick = async () => {
    const userInfo = await getUserInfo();
    const usuarioId = userInfo.userId;

    if (selectedBarberoId && selectedDate && selectedHour !== null) {
      try {
        const formattedHour = selectedHour.slice(0, 5);

        const nuevaCita = {
          id_empleado: selectedBarberoId,
          id_usuario: usuarioId,  // Línea 137
          Fecha_Atencion: selectedDate,
          Hora_Atencion: formattedHour,
          Hora_Fin: selectedHourFin,
        };

        const response = await CitasDataService.create(nuevaCita);
        await createCitaServicio(response.data.id_cita, selectedServices);

        if (response) {
          console.log("Cita agendada correctamente");
          Swal.fire({
            icon: "success",
            title: "Cita agendada correctamente",
            showConfirmButton: false,
          }).then(() => {
            window.location.href = "/cliente/listacitas";
          });

          // Actualizar las horas ocupadas
          const updatedHorasOcupadas = await getHorasOcupadas(usuarioId);  // Línea 138
          setHorasOcupadas(updatedHorasOcupadas);

          // Actualizar las opciones disponibles
          const opciones = generateHourOptions(
            agendaData[0].horaInicio,
            agendaData[0].horaFin,
            selectedDate,
            updatedHorasOcupadas  // Utilizar las horas ocupadas actualizadas
          );
          setOptions(opciones);
        }
      } catch (error) {
        console.error("Error al agendar la cita:", error);
        Swal.fire({
          icon: "error",
          title: "Error al agendar la cita",
          text: error.message,
        });
      }
    } else {
      console.error("Error al agendar la cita: No se han seleccionado empleado, fecha o hora");
      Swal.fire({
        icon: "error",
        title: "Error al agendar la cita",
        text: "Completa la selección de empleado, fecha y hora antes de agendar",
      });
    }
  };

  useEffect(() => {
    if (selectedBarberoId && selectedDate) {
      const opciones = generateHourOptions(
        agendaData[0].horaInicio,
        agendaData[0].horaFin,
        selectedDate
      );
      setOptions(opciones);
    }
  }, [selectedBarberoId, selectedDate, horasOcupadas]);


  const handleHourSelection = (selectedHour) => {
    const newTime = addMinutes(selectedHour, selectedServicesDuration);
    if (newTime) {
      setSelectedHour(selectedHour);
      setSelectedHourFin(newTime);
    }
  };

  const handleRemoveService = (serviceToRemove) => {
    // Filtrar los servicios seleccionados para eliminar el servicio seleccionado
    const updatedSelectedServices = tempSelectedServices.filter(
      (service) => service.id !== serviceToRemove.id
    );

    // Actualizar el estado de los servicios seleccionados
    setTempSelectedServices(updatedSelectedServices);

    // Actualizar la duración total de los servicios seleccionados
    const removedServiceDuration = parseInt(serviceToRemove.tiempo);
    setSelectedServicesDuration((prevDuration) => prevDuration - removedServiceDuration);
  };

  // Function to calculate the total value of selected services
  const calculateTotalValue = () => {
    return tempSelectedServices.reduce((total, service) => total + service.valor, 0);
  };

  return (
    <CContainer>
      <h3 className="text-center">RESERVAR CITA</h3>
      <CRow>
        <CCol>
          <CCard>
            <CCardBody>
              <CPagination align="center" aria-label="Page navigation example">
                <CPaginationItem
                  active={currentPage === 1}
                  onClick={() => handlePageChange(1)}
                >
                  1. Servicio
                </CPaginationItem>
                <CPaginationItem
                  active={currentPage === 2}
                  onClick={() => handlePageChange(2)}
                  disabled={selectedServices.length === 0} // Deshabilitar si no hay servicios seleccionados
                >
                  2. Barbero
                </CPaginationItem>
                <CPaginationItem
                  active={currentPage === 3}
                  onClick={() => handlePageChange(3)}
                  disabled={!selectedBarberoId} // Deshabilitar si no se ha seleccionado un barbero
                >
                  3. Fecha y Hora
                </CPaginationItem>
              </CPagination>

              <CCardTitle>
                {currentPage === 1 && "Selecciona un Servicio"}
                {currentPage === 2 && "Selecciona un Barbero"}
                {currentPage === 3 && "Selecciona Fecha y Hora"}
              </CCardTitle>

              {currentPage === 1 && (
                <>
                  <CButton onClick={() => setVisibleLg(!visibleLg)}>
                    Seleccionar Servicios
                  </CButton>

                  {selectedServices.length > 0 ? (
                    <CCard className="mt-3">
                      <CCardBody>
                        <CCardTitle>Servicios Seleccionados</CCardTitle>
                        <CTable>
                          <CTableHead>
                            <CTableRow>
                              <CTableHeaderCell scope="col">#</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Valor</CTableHeaderCell>
                              <CTableHeaderCell scope="col">Acción</CTableHeaderCell>
                            </CTableRow>
                          </CTableHead>
                          <CTableBody>
                            {selectedServices.map((service, index) => (
                              <CTableRow key={index}>
                                <CTableDataCell>{index + 1}</CTableDataCell>
                                <CTableDataCell>{service.nombre}</CTableDataCell>
                                <CTableDataCell>{service.valor}</CTableDataCell>
                                <CTableDataCell>
                                  <CButton
                                    color="danger"
                                    onClick={() => handleRemoveService(service)}
                                  >
                                    Quitar
                                  </CButton>
                                </CTableDataCell>
                              </CTableRow>
                            ))}
                          </CTableBody>
                        </CTable>
                      </CCardBody>
                    </CCard>
                  ) : (
                    <div className="mt-3">
                      <CAlert color="info">
                        No se han seleccionado servicios.
                      </CAlert>
                    </div>
                  )}

                  <CModal
                    size="lg"
                    scrollable
                    visible={visibleLg}
                    onClose={() => setVisibleLg(false)}
                    aria-labelledby="ScrollingLongContentExampleLabel2"
                  >
                    <CModalHeader>
                      <CModalTitle id="ScrollingLongContentExampleLabel2">
                        Seleciona los servicios
                      </CModalTitle>
                    </CModalHeader>
                    <CModalBody>
                      <CTable>
                        <CTableHead>
                          <CTableRow></CTableRow>
                        </CTableHead>
                        <CModalBody>
                          <CTable style={{ borderCollapse: "separate", borderSpacing: "5px" }}>
                            <CTableBody>
                              {servicesData.map((service, index) => (
                                <React.Fragment key={`row-${index}`}>
                                  {index % 5 === 0 && <tr key={`row-${index}`}></tr>}
                                  <td
                                    key={service.id}
                                    style={{
                                      padding: "8px",
                                      border: selectedServices.some((s) => s.id === service.id)
                                        ? "2px solid #e83d3d"
                                        : "1px solid #ddd",
                                      width: "20%",
                                      backgroundColor: "#2c3e50",
                                      color: "#fff",
                                      borderRadius: "10px",
                                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                                    }}
                                  >
                                    <div style={{ width: "100%" }}>
                                      <div
                                        style={{
                                          borderBottom: "3px solid #ddd",
                                          padding: "0px",
                                        }}
                                      >
                                        {service.nombre}
                                      </div>
                                      <div style={{ padding: "1px" }}>Precio: {service.valor}</div>
                                      <button
                                        style={{
                                          backgroundColor: selectedServices.some(
                                            (s) => s.id === service.id
                                          )
                                            ? "#e83d3d"
                                            : "#4caf50",
                                          color: "#fff",
                                          padding: "2px",
                                          cursor: "pointer",
                                          borderRadius: "5px",
                                          width: "100%",
                                        }}
                                        onClick={() => handleServiceSelection(service)}
                                      >
                                        {selectedServices.some((s) => s.id === service.id)
                                          ? "Quitar"
                                          : "Seleccionar"}
                                      </button>
                                    </div>
                                  </td>
                                  {(index + 1) % 5 === 0 && <tr key={`end-${index}`}></tr>}
                                </React.Fragment>
                              ))}
                            </CTableBody>
                          </CTable>
                        </CModalBody>
                      </CTable>
                    </CModalBody>
                    <CModalFooter style={{ justifyContent: 'center' }}>
                      <CButton
                        color="primary"
                        onClick={() => {
                          handleAcceptButtonClick();
                          handlePageChange(2);
                        }}
                        style={{
                          marginTop: "5px",
                          width: "50%",
                        }}
                      >
                        Aceptar
                      </CButton>
                      <CButton
                        color="secondary"
                        onClick={() => setVisibleLg(false)}
                        style={{
                          marginTop: "5px",
                          width: "50%",
                        }}
                      >
                        Cancelar
                      </CButton>
                    </CModalFooter>
                  </CModal>
                </>
              )}

              {currentPage === 2 && (
                <CContainer>
                  <h3>Barberos Disponibles</h3>
                  {empleados.length > 0 ? (
                    <CRow>
                      {empleados.map((empleado, index) => (
                        <CCol key={index} sm="auto">
                          <CCard
                            onClick={() => handleBarberoSelection(empleado.id_empleado)}
                            style={{
                              cursor: "pointer",
                              border:
                                selectedBarberoId === empleado.id_empleado
                                  ? "2px solid #00000bff"
                                  : "4px solid #ddd",
                              backgroundColor:
                                selectedBarberoId === empleado.id_empleado
                                  ? "#fff"
                                  : "#f8f9fa",
                              color:
                                selectedBarberoId === empleado.id_empleado
                                  ? "#000"
                                  : "#000",
                              boxShadow:
                                selectedBarberoId === empleado.id_empleado
                                  ? "0 0 30px rgba(0,0,0,0.9)"
                                  : "0 0 15px rgba(0,0,0,0.1)",
                              borderRadius: "15px",
                              transition: "all 0.3s ease",
                              padding: "1px",
                              margin: "1px",
                              height: "55px",
                            }}
                          >
                            <CCardBody>
                              <CCardTitle>{empleado.nombre}</CCardTitle>
                            </CCardBody>
                          </CCard>
                        </CCol>
                      ))}
                    </CRow>
                  ) : (
                    <div className="mt-3">
                      <CAlert color="info">
                        No hay datos de agenda disponibles.
                      </CAlert>
                    </div>
                  )}
                </CContainer>
              )}

              {currentPage === 3 && (
                <CCard>
                  <CCardBody>
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      initialDate={new Date()}
                      selectable={true}
                      select={(info) => handleDateSelect(info)}
                      events={agendaData.map((agendaItem) => ({
                        title: "Disponible",
                        start: agendaItem.fechaInicio,
                        end: agendaItem.fechaFin,
                        color: "#28a745",
                        textColor: "#fff",
                        allDay: false,
                        editable: false,
                        selectable: true,
                      }))}
                      eventClick={(info) => {
                        info.el.style.backgroundColor = '#e83d3d';
                      }}
                    />
                    <CModal
                      scrollable
                      alignment="center"
                      size="lg"
                      backdrop="static"
                      visible={modalHoraVisible}
                      onClose={() => setModalHoraVisible(false)}
                      aria-labelledby="LiveDemoExampleLabel"
                    >
                      <CModalHeader>
                        <CModalTitle id="LiveDemoExampleLabel">
                          Selecciona una Hora
                        </CModalTitle>
                      </CModalHeader>
                      <CModalBody>
                        {agendaData && agendaData.length > 0 && (
                          <div>
                            <h4>Horas para el día {selectedDate}</h4>
                            <div>
                              {generateHourOptions(
                                agendaData[0].horaInicio,
                                agendaData[0].horaFin,
                                selectedDate,
                                citasAgendadas
                              )}
                            </div>
                          </div>
                        )}
                      </CModalBody>
                      <CModalFooter>
                        <CButton color="secondary" onClick={() => setModalHoraVisible(false)}>
                          Cancelar
                        </CButton>
                        <CButton
                          color="primary"
                          onClick={() => {
                            if (selectedHour !== null) {
                              const horaFin = addMinutes(selectedHour, selectedServicesDuration);
                              setSelectedHourFin(horaFin);
                              setModalHoraVisible(false);
                            } else {
                              Swal.fire({
                                icon: "error",
                                title: "Error al Seleccionar la Hora",
                                text: "Selecciona una hora antes de continuar",
                              });
                            }
                          }}
                        >
                          Seleccionar Hora
                        </CButton>
                      </CModalFooter>
                    </CModal>
                  </CCardBody>
                </CCard>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={4}>
          <CCard>
            <CCardText>
              {selectedBarberoId && selectedDate && selectedHour ? (
                <div>
                  <p>
                    <CCardTitle className="text-center">
                      <strong>Información de tus Servicios</strong>
                    </CCardTitle>
                    <strong>Empleado:</strong> {selectedBarberoName} <br />
                    <strong>Fecha:</strong> {selectedDate} <br />
                    <strong>Hora inicio:</strong> {selectedHour !== null ? `${selectedHour > 12 ? selectedHour - 12 : selectedHour} ${selectedHour >= 12 ? 'PM' : 'AM'}` : 'Selecciona una hora'} <br />
                    <strong>Hora Fin:</strong> {selectedHour !== null ? addMinutes(selectedHour, selectedServicesDuration) : 'Selecciona una hora'} <br />
                    <p><strong>Total:</strong> ${calculateTotalValue().toLocaleString()}</p>
                    <strong>Servicios:</strong>
                  </p>
                  <ul>
                    {selectedServices.map((service, index) => (
                      <li key={index}>
                        {service.nombre} <br />
                        <strong style={{ display: "inline-block", width: "50px" }}>Valor:</strong> ${service.valor.toLocaleString()}
                      </li>
                    ))}
                  </ul>
                  <p><strong>Tiempo aprox  de la cita:</strong> {selectedServicesDuration} minutos</p>
                </div>
              ) : (
                <p>Completa la selección de empleado, fecha y hora.</p>
              )}
            </CCardText>
          </CCard>
        </CCol>
      </CRow>
      <CRow className="fixed-bottom p-3 bg-dark">
        <CCol className="d-flex justify-content-start">
          <CButton
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Anterior
          </CButton>
        </CCol>
        <CCol className="d-flex justify-content-end">
          {currentPage < 3 ? (
            <CButton
              disabled={
                (currentPage === 1 && selectedServices.length === 0) ||
                (currentPage === 2 && !selectedBarberoId)
              }
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Siguiente
            </CButton>
          ) : (
            <CButton
              color="success"
              onClick={handleAgendarClick}
              disabled={!selectedHour}
            >
              Agendar
            </CButton>
          )}
        </CCol>
      </CRow>
    </CContainer>
  );
};

export default AgendarCita;