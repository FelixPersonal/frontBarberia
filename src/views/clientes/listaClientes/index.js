import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { CPaginationItem } from '@coreui/react';
import { FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Switch from 'react-switch';
import {
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CButton,
    CButtonGroup,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormLabel,
    CFormInput,
    CFormCheck,
    CPagination,
} from '@coreui/react';
import ClienteService from 'src/views/services/clienteService';

const ListaClientes = () => {
    const [visible, setVisible] = useState(false);
    const [clientes, setClientes] = useState(null);
    const [selectedClienteId, setSelectedClienteId] = useState(null);
    const [selectedClientes, setSelectedClientes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    const fetchClientes = async () => {
        try {
            const response = await ClienteService.getAllClientes();
            const data = response.listClientes || [];
            setClientes(data);
            console.log('Clientes:', data);
        } catch (error) {
            console.error('Error al obtener clientes:', error);
            setClientes([]);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleEditar = (cliente) => {
        setSelectedClienteId(cliente);
        setVisible(true);
    };

    const handleEliminar = async (id_cliente) => {
        try {
            const cliente = clientes.find((item) => item.id_cliente === id_cliente);

            if (cliente && cliente.estado) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No se puede eliminar un cliente activo',
                    showConfirmButton: false,
                    timer: 1500,
                });
            } else {
                await ClienteService.eliminarCliente(id_cliente);
                fetchClientes();
                Swal.fire({
                    icon: 'success',
                    title: 'Cliente eliminado',
                    showConfirmButton: false,
                    timer: 1500,
                });
            }
        } catch (error) {
            console.error('Error al eliminar el cliente:', error);
        }
    };

    const handleGuardarCambios = async () => {
        try {
            if (selectedClienteId && selectedClienteId.id_cliente) {
                await ClienteService.updateCliente(
                    selectedClienteId.id_cliente,
                    selectedClienteId
                );
                fetchClientes();
                setVisible(false);
                Swal.fire({
                    icon: 'success',
                    title: 'Cambios guardados',
                    showConfirmButton: false,
                    timer: 1500,
                });
            } else {
                console.error('Error: ID de cliente no definido o válido.');
            }
        } catch (error) {
            console.error('Error al guardar cambios:', error);
        }
    };

    const handleCambiarEstado = async (id_cliente, estado) => {
        Swal.fire({
            title: `¿Estás seguro de cambiar el estado del cliente a ${estado}?`,
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, cambiar estado"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const clienteIndex = clientes.findIndex(
                        (item) => item.id_cliente === id_cliente
                    );

                    if (clienteIndex !== -1) {
                        const updatedClientes = [...clientes];
                        updatedClientes[clienteIndex] = {
                            ...updatedClientes[clienteIndex],
                            estado: !updatedClientes[clienteIndex].estado,
                        };

                        await ClienteService.updateCliente(
                            id_cliente,
                            { ...updatedClientes[clienteIndex] }
                        );
                        setClientes(updatedClientes);

                        Swal.fire({
                            position: "center",
                            icon: "success",
                            title: "¡El estado del cliente ha sido cambiado exitosamente!",
                            showConfirmButton: false,
                            timer: 1500,
                        });
                    } else {
                        console.error('Cliente no encontrado.');
                        Swal.fire({
                            icon: "error",
                            title: "¡Error!",
                            text: "Hubo un problema al cambiar el estado del cliente.",
                        });
                    }
                } catch (error) {
                    console.error("Error al cambiar el estado del cliente:", error);
                    Swal.fire({
                        icon: "error",
                        title: "¡Error!",
                        text: "Hubo un problema al cambiar el estado del cliente.",
                    });
                }
            }
        });
    };

    const handleSendMessage = async () => {
        try {
            const selectedClients = clientes.filter(cliente => selectedClientes.includes(cliente.id_cliente));
            await Promise.all(selectedClients.map(async (cliente) => {
                try {
                    console.log(`Enviando mensaje al cliente ID: ${cliente.id_cliente}`);
                    const response = await ClienteService.enviarAgendaSemana(cliente.id_cliente);
                    console.log(`Mensaje enviado correctamente al cliente ID: ${cliente.id_cliente}`, response);
                } catch (error) {
                    console.error(`Error al enviar mensaje al cliente ID: ${cliente.id_cliente}`, error);

                    // Mostrar mensaje de error específico en el frontend
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al enviar mensaje',
                        text: `Error al enviar mensaje al cliente ID: ${cliente.id_cliente}: ${error.message}`,
                    });
                    throw error; // Re-lanza el error para que `Promise.all` lo capture
                }
            }));
            Swal.fire({
                icon: 'success',
                title: 'Mensajes enviados correctamente',
                showConfirmButton: false,
                timer: 1500,
            });
        } catch (error) {
            console.error('Error al enviar mensajes:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al enviar mensajes',
                text: `Hubo un problema al enviar los mensajes a los clientes seleccionados: ${error.message}`,
            });
        }
    };









    const handleSelectAll = () => {
        if (selectedClientes.length === paginatedClientes.length) {
            setSelectedClientes([]);
        } else {
            const allClienteIds = paginatedClientes.map(cliente => cliente.id_cliente);
            setSelectedClientes(allClienteIds);
        }
    };

    const handleSelectCliente = (id_cliente) => {
        setSelectedClientes(prevSelected =>
            prevSelected.includes(id_cliente)
                ? prevSelected.filter(id => id !== id_cliente)
                : [...prevSelected, id_cliente]
        );
    };

    const filteredClientes = clientes
        ? clientes.filter((cliente) =>
            cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.documento.toString().includes(searchTerm) ||
            cliente.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cliente.telefono.toString().includes(searchTerm)
        )
        : [];

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedClientes = filteredClientes.slice(startIndex, endIndex);

    return (


        <CRow>
            <CCol xs={12}>
                <CCard>
                    <CCardHeader className="d-flex justify-content-between align-items-center">

                        <div className="button-container">
                            <Link to="/Clientes/CrearClientes">
                                <CButton color="primary">Agregar Cliente</CButton>
                            </Link>

                            {selectedClientes.length > 0 && (
                                <>
                                    <CButton color="info" onClick={handleSelectAll}>
                                        Select Todo
                                    </CButton>
                                    <CButton color="success" onClick={handleSendMessage}>
                                        Enviar
                                    </CButton>
                                </>
                            )}
                        </div>
                    </CCardHeader>
                    <br />
                    <CCardHeader>
                        <CCol xs={3}>
                            <div className="mt-2">
                                <div>
                                    <strong>Listado de clientes</strong>
                                </div>
                                <br />
                                <CFormInput
                                    type="text"
                                    placeholder="Buscar cliente..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CCol>
                    </CCardHeader>


                    <CCardBody>
                        <CTable align="middle" className="mb-0 border" hover responsive>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>

                                    </CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Documento</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Apellido</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Correo</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Teléfono</CTableHeaderCell>
                                    <CTableHeaderCell scope="col">Estado</CTableHeaderCell>
                                    <CTableHeaderCell scope="col"></CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {Array.isArray(paginatedClientes) &&
                                    paginatedClientes.length > 0 &&
                                    paginatedClientes.map((cliente, index) => (
                                        <CTableRow key={cliente.id_cliente}>
                                            <CTableDataCell>
                                                <CFormCheck
                                                    id={`select-${cliente.id_cliente}`}
                                                    onChange={() => handleSelectCliente(cliente.id_cliente)}
                                                    checked={selectedClientes.includes(cliente.id_cliente)}
                                                />
                                            </CTableDataCell>
                                            <CTableDataCell>{cliente.documento}</CTableDataCell>
                                            <CTableDataCell>{cliente.nombre}</CTableDataCell>
                                            <CTableDataCell>{cliente.apellido}</CTableDataCell>
                                            <CTableDataCell>{cliente.correo}</CTableDataCell>
                                            <CTableDataCell>{cliente.telefono}</CTableDataCell>
                                            <CTableDataCell>
                                                <CButtonGroup aria-label="Acciones del Cliente">
                                                    <CTableDataCell>
                                                        <CButton
                                                            style={{
                                                                marginRight: '30px',
                                                                marginTop: '2px',  // Ajusta el margen superior según tus necesidades
                                                                backgroundColor: cliente.estado ? '#12B41A' : 'red',
                                                                color: 'white',
                                                                fontWeight: 'bold',
                                                                fontSize: '14px',  // Ajusta el tamaño del texto según tus necesidades
                                                                padding: '5px 12px',  // Ajusta el espaciado interno según tus necesidades
                                                                border: '1px solid #333',
                                                            }}
                                                        >
                                                            {cliente.estado ? 'Activo' : 'Inactivo'}
                                                        </CButton>
                                                    </CTableDataCell>
                                                    <div style={{ transform: 'scaleY(1.3)', marginRight: '7px', marginTop: '8px' }}>
                                                        <Switch
                                                            onChange={() => handleCambiarEstado(cliente.id_cliente)}
                                                            checked={cliente.estado}
                                                            onColor="#001DAE"
                                                            onHandleColor="#FFFFFF"
                                                            handleDiameter={18}
                                                            uncheckedIcon={false}
                                                            checkedIcon={false}
                                                            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                                            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                                            height={24}
                                                            width={35}
                                                        />
                                                    </div>
                                                    <CButton
                                                        color="secondary"
                                                        size="sm" // Tamaño pequeño
                                                        onClick={() => handleEditar(cliente)}
                                                        style={{
                                                            marginRight: '5px', // Ajusta el margen derecho según tus necesidades
                                                            backgroundColor: 'grey',
                                                            boxShadow: '1px 2px 4px rgba(0, 0, 0, 0.1)',
                                                            padding: '2px 6px', // Ajusta el padding según tus necesidades
                                                            borderRadius: '5px',
                                                        }}
                                                    >
                                                        <FaEdit style={{ color: 'black' }} />
                                                    </CButton>

                                                    <CButton
                                                        color="danger"
                                                        size="sm" // Tamaño pequeño
                                                        onClick={() => {
                                                            Swal.fire({
                                                                title: '¿Estás seguro que desea eliminar este cliente?',
                                                                text: 'Esta acción no se puede deshacer.',
                                                                icon: 'warning',
                                                                showCancelButton: true,
                                                                confirmButtonColor: '#d33',
                                                                cancelButtonColor: '#3085d6',
                                                                confirmButtonText: 'Sí, eliminar',
                                                                cancelButtonText: 'Cancelar',
                                                            }).then((result) => {
                                                                if (result.isConfirmed) {
                                                                    handleEliminar(cliente.id_cliente);
                                                                }
                                                            });
                                                        }}
                                                        style={{
                                                            borderRadius: '5px', // Ajusta el radio de los bordes según tus necesidades
                                                        }}
                                                    >
                                                        <FaTrash /> {/* Icono de eliminar */}
                                                    </CButton>
                                                </CButtonGroup>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                            </CTableBody>
                        </CTable>
                        <CPagination
                            align="center"
                            aria-label="Page navigation example"
                            className="mt-3"
                        >
                            <CPaginationItem
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Anterior
                            </CPaginationItem>
                            {Array.from(
                                { length: Math.ceil(filteredClientes.length / pageSize) },
                                (_, i) => (
                                    <CPaginationItem
                                        key={i}
                                        onClick={() => handlePageChange(i + 1)}
                                        active={i + 1 === currentPage}
                                    >
                                        {i + 1}
                                    </CPaginationItem>
                                )
                            )}
                            <CPaginationItem
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={
                                    currentPage === Math.ceil(filteredClientes.length / pageSize)
                                }
                            >
                                Siguiente
                            </CPaginationItem>
                        </CPagination>
                    </CCardBody>
                </CCard>
            </CCol>

            <CModal visible={visible} onClose={() => setVisible(false)}>
                <CModalHeader>
                    <CModalTitle>Editar Cliente</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <form>
                        <div className="mb-3">
                            <CFormLabel>Nombre</CFormLabel>
                            <CFormInput
                                type="text"
                                value={selectedClienteId ? selectedClienteId.nombre : ''}
                                onChange={(e) =>
                                    setSelectedClienteId({
                                        ...selectedClienteId,
                                        nombre: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Apellido</CFormLabel>
                            <CFormInput
                                type="text"
                                value={selectedClienteId ? selectedClienteId.apellido : ''}
                                onChange={(e) =>
                                    setSelectedClienteId({
                                        ...selectedClienteId,
                                        apellido: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Documento</CFormLabel>
                            <CFormInput
                                type=""
                                value={selectedClienteId ? selectedClienteId.documento : ''}
                                onChange={(e) =>
                                    setSelectedClienteId({
                                        ...selectedClienteId,
                                        documento: e.target.value,
                                    })
                                }
                                disabled={false}
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Correo</CFormLabel>
                            <CFormInput
                                type="email"
                                value={selectedClienteId ? selectedClienteId.correo : ''}
                                onChange={(e) =>
                                    setSelectedClienteId({
                                        ...selectedClienteId,
                                        correo: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="mb-3">
                            <CFormLabel>Teléfono</CFormLabel>
                            <CFormInput
                                type="text"
                                value={selectedClienteId ? selectedClienteId.telefono : ''}
                                onChange={(e) =>
                                    setSelectedClienteId({
                                        ...selectedClienteId,
                                        telefono: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </form>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={() => setVisible(false)}>
                        Cerrar
                    </CButton>
                    <CButton color="primary" onClick={handleGuardarCambios}>
                        Guardar Cambios
                    </CButton>
                </CModalFooter>
            </CModal>
        </CRow>
    );
};

export default ListaClientes;
