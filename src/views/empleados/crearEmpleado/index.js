import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CFormLabel,
    CFormSelect,
    CFormInput,
    CInputGroup,
    CInputGroupText,
    CRow,
    CFormFeedback,
} from '@coreui/react';
import EmpleadoService from 'src/views/services/empleadoService';
import { useProfileImage } from 'src/views/ProfileImageContext';

function CrearEmpleado() {

    const navigate = useNavigate();
    const [foto, setFoto] = useState(null);
    const { setProfileImage } = useProfileImage();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [correo, setCorreo] = useState('');
    const [documento, setDocumento] = useState('');
    const [telefono, setTelefono] = useState('');
    const [estado, setEstado] = useState('');
    const [documentoApi, setdocumentoApi] = useState('');
    const [errorDocumento, setError] = useState(false);
    const [errordocumento, setErrorDocumento] = useState(false);

    const [empleados, setEmpleados] = useState([]);

    const handleSuccessAlert = () => {
        Swal.fire({
            icon: 'success',
            title: 'Registro exitoso',
            text: 'El empleado ha sido registrado correctamente',
        }).then(() => {
            navigate('/empleados/listaEmpleados');
        });
    };

    const validardocumento = async () => {
        setError(false); // Reinicias el estado de error

        if (documento.length > 0) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No hay token disponible');
                    return;
                }

                const respuesta = await fetch(`http://localhost:8095/api/validar?documento=${documento}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const datosRespuesta = await respuesta.json();
                if (datosRespuesta.documento === 'El documento ya existe') {
                    setError(true); // Estableces el estado de error en true si el documento ya existe
                }
                setdocumentoApi(datosRespuesta.documento);
            } catch (error) {
                console.error(error)
            }
        }
    };



    //Estados para manejar mensajes de error
    const [nombreError, setNombreError] = useState('');
    const [apellidoError, setApellidoError] = useState('');
    const [correoError, setCorreoError] = useState('');
    const [documentoError, setDocumentoError] = useState('');
    const [telefonoError, setTelefonoError] = useState('');

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const handleGuardarEmpleado = async (e) => {
        e.preventDefault();


        // Limpia mensajes de error
        setNombreError('');
        setApellidoError('');
        setCorreoError('');
        setDocumentoError('');
        setTelefonoError('');


        if (!nombre || !apellido || !correo || !documento || !telefono) {
            // Establece los mensajes de error si faltan campos
            setNombreError(nombre ? '' : 'Este campo es obligatorio');
            setApellidoError(apellido ? '' : 'Este campo es obligatorio');
            setCorreoError(correo ? '' : 'Este campo es obligatorio');
            setDocumentoError(documento ? '' : 'Este campo es obligatorio');
            setTelefonoError(telefono ? '' : 'Este campo es obligatorio');
            return;
        }

        // Validar el nombre con la expresión regular
        if (!/^[A-Za-z0-9 ]+$/.test(nombre)) {
            setNombreError('El nombre debe contener solo letras');
            return;
        }

        const nombreCapitalizado = capitalizeFirstLetter(nombre);


        if (!/^[A-Za-z ]+$/.test(apellido)) {
            setApellidoError('El apellido debe de contener solo letras');
            return;
        }

        const apellidoCapitalizado = capitalizeFirstLetter(apellido);


        if (!/^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(correo)) {
            setCorreoError('Ingrese por favor un correo valido');
            return;
        }

        if (!/^\d{6,10}$/.test(documento)) {
            setDocumentoError('La cedula debe de contener solo números');
            setDocumentoError('Debe de contener maximo 10 dígitos');
            setDocumentoError('Debe de contener minimo 6 dígitos');
            return;
        }

        if (!/^\d{1,10}$/.test(telefono)) {
            setTelefonoError('Ingresa solo números y solo se ingresan menos de 10 dígitos');
            return;
        }

        const newEmpleado = {
            nombre: nombreCapitalizado,
            apellido: apellidoCapitalizado,
            correo,
            documento,
            telefono,
            estado,
            foto: foto
        };

        try {
            const response = await EmpleadoService.createEmpleado(newEmpleado);
            console.log('Empleado creado:', response);

            setEmpleados([...empleados, response]);

            handleSuccessAlert();

            // Restablecer los campos después de enviar los datos
            setNombre('');
            setApellido('');
            setCorreo('');
            setDocumento('');
            setTelefono('');
            setFoto(null); // Reiniciar el estado de la foto después de enviarla al servidor

            // Verificar si setProfileImage está definido antes de llamarlo
            if (setProfileImage) {
                setProfileImage(foto);
            }
        } catch (error) {
            console.error('Error al crear el empleado:', error);
        }

    };
    const handleBlurDocumento = async () => {
        await validardocumento();
    };

    return (
        <CRow>
            <CCol>
                <CCard>
                    <CCardHeader>
                        <strong>Registrar</strong>
                    </CCardHeader>
                    <CCardBody>
                        <form onSubmit={handleGuardarEmpleado}>

                            <CRow>
                                <CCol xs={12} sm={6}>
                                    <div className="mb-3">
                                        <CFormLabel style={{ fontWeight: 'bold' }}>Documento</CFormLabel>
                                        <CFormInput
                                            type="text" // Cambiado a tipo texto para evitar el control de HTML5
                                            minLength={6}
                                            maxLength={10}
                                            value={documento}
                                            onBlur={handleBlurDocumento}
                                            onChange={(e) => {
                                                // Reemplaza cualquier carácter no numérico con una cadena vacía
                                                let newValue = e.target.value.replace(/[^\d]/g, '');

                                                // Limita el valor a 10 caracteres
                                                newValue = newValue.slice(0, 10);

                                                setDocumento(newValue);

                                                if (newValue.length < 6) {
                                                    setDocumentoError('La cédula debe tener como mínimo 6 caracteres');
                                                } else if (!/^\d{6,10}$/.test(newValue)) {
                                                    setDocumentoError('La cédula debe contener solo números');
                                                } else {
                                                    setDocumentoError('');
                                                }
                                            }}
                                            invalid={documentoError !== '' || errorDocumento} // Considera el estado de error del documento
                                        />
                                        <CFormFeedback invalid>{documentoError}</CFormFeedback>
                                    </div>
                                </CCol>

                                {errorDocumento &&
                                    <p style={{ color: 'red' }}>Ya existe un empleado con éste número de cédula</p>
                                }

                                <CCol xs={12} sm={6}>
                                    <div className="mb-3">
                                        <CFormLabel style={{ fontWeight: 'bold' }}>Nombre</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            value={nombre}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                setNombre(newValue);

                                                // Validar si el campo está vacío
                                                if (!newValue.trim()) {
                                                    setNombreError('Este campo es obligatorio');
                                                } else {
                                                    setNombreError('');
                                                }

                                                // Expresión regular para permitir solo letras, números y espacios
                                                const regex = /^[A-Za-z0-9\s]+$/;
                                                if (!regex.test(newValue)) {
                                                    setNombreError('El nombre debe contener solo letras, números y espacios');
                                                } else {
                                                    setNombreError('');
                                                }
                                            }}
                                            invalid={nombreError !== ''}
                                        />
                                        <CFormFeedback invalid>{nombreError}</CFormFeedback>
                                    </div>
                                </CCol>
                            </CRow>


                            <CRow>
                                <CCol xs={12} sm={6}>
                                    <div className="mb-3">
                                        <CFormLabel style={{ fontWeight: 'bold' }}>Apellido</CFormLabel>
                                        <CFormInput
                                            type="text"
                                            value={apellido}
                                            onChange={(e) => {
                                                // Expresión regular para permitir solo letras y espacios
                                                const newValue = e.target.value.replace(/[^A-Za-z\s]/gi, '');
                                                setApellido(newValue);

                                                // Validar si el campo está vacío
                                                if (!newValue.trim()) {
                                                    setApellidoError('Este campo es obligatorio');
                                                } else {
                                                    setApellidoError('');
                                                }
                                            }}
                                            invalid={apellidoError !== ''}
                                        />

                                        <CFormFeedback invalid>{apellidoError}</CFormFeedback>
                                    </div>
                                </CCol>


                                <CCol xs={12} sm={6}>
                                    <div className="mb-3">
                                        <CFormLabel style={{ fontWeight: 'bold' }}>Correo</CFormLabel>
                                        <CFormInput
                                            type="email"
                                            value={correo}
                                            onChange={(e) => {
                                                const newValue = e.target.value;
                                                setCorreo(newValue);

                                                // Validar si el campo está vacío
                                                if (!newValue.trim()) {
                                                    setCorreoError('Este campo es obligatorio');
                                                } else {
                                                    setCorreoError('');
                                                }

                                                // Expresión regular para validar el formato del correo electrónico
                                                const regex = /^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
                                                if (!regex.test(newValue)) {
                                                    setCorreoError('Ingrese por favor un correo válido');
                                                } else {
                                                    setCorreoError('');
                                                }
                                            }}
                                            invalid={correoError !== ''}
                                        />
                                        <CFormFeedback invalid>{correoError}</CFormFeedback>
                                    </div>
                                </CCol>
                            </CRow>


                            <CRow>
                                <CCol xs={12} sm={6}>
                                    <div className="mb-3">
                                        <CFormLabel style={{ fontWeight: 'bold' }}>Teléfono</CFormLabel>
                                        <CFormInput
                                            type='text'
                                            value={telefono}
                                            maxLength={10}
                                            onChange={(e) => {
                                                const newValue = e.target.value.replace(/[^\d]/g, '');
                                                setTelefono(newValue);
                                                if (!newValue.trim()) {
                                                    setTelefonoError('Este campo es obligatorio');
                                                } else {
                                                    setTelefonoError('');
                                                }
                                                const regex = /^\d{10}$/;
                                                if (!regex.test(newValue)) {
                                                    setTelefonoError('El teléfono debe contener exactamente 10 dígitos');
                                                } else {
                                                    setTelefonoError('');
                                                }
                                            }}
                                            invalid={telefonoError !== ''}
                                        />
                                        <CFormFeedback invalid>{telefonoError}</CFormFeedback>
                                    </div>
                                </CCol>

                                <CCol xs={12} sm={6}>
                                    <div className="mb-3">
                                        <CFormLabel style={{ fontWeight: 'bold' }}>Foto</CFormLabel>
                                        <CFormInput
                                            type="file"
                                            name="foto" 
                                            onChange={(e) => {
                                                const selectedFile = e.target.files[0];
                                                setFoto(selectedFile);
                                            }}
                                        />
                                    </div>
                                </CCol>
                            </CRow>



                            <CButton type="submit" color="primary" className="mr-2">
                                Guardar Empleado
                            </CButton>
                            <Link to="/empleados/listaEmpleados">
                                <CButton type="button" color="secondary">
                                    Cancelar
                                </CButton>
                            </Link>
                        </form>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    );
}

export default CrearEmpleado