

const apiUrl = 'http://localhost:8095/api/empleado';


const EmpleadoService = {
    getAllEmpleados: () => {
        const token = localStorage.getItem('token');
        return fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .catch(error => {
                console.error('Error al obtener los empleados:', error);
            });
    },

    getEmpleadoById: (id) => {
        const token = localStorage.getItem('token');
        return fetch(`${apiUrl}/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .catch(error => {
                console.error('Error al obtener el empleado por ID:', error);
            });
    },

    createEmpleado: (newEmpleado) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        Object.keys(newEmpleado).forEach(key => {
            formData.append(key, newEmpleado[key]);
        });

        return fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        })
            .then(response => response.json())
            .catch(error => {
                console.error('Error al crear el empleado:', error);
            });
    },




    updateEmpleado: (id, updatedEmpleado) => {
        const token = localStorage.getItem('token');
        return fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedEmpleado),
        })
            .then(response => response.json())
            .catch(error => {
                console.error('Error al actualizar el empleado:', error);
            });
    },

    cambiarEstadoEmpleado: (id) => {
        const token = localStorage.getItem('token');
        return fetch(`${apiUrl}/cambiarEstado/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .catch(error => {
                console.error('Error al cambiar el estado del empleado:', error);
            });
    },

    // getEmpleadoConCitas: (id) => {
    //     const token = localStorage.getItem('token');
    //     return fetch(`${apiUrl}/empleados/${id}?include=citas`, { // Incluir citas en la consulta
    //         headers: {
    //             'Authorization': `Bearer ${token}`
    //         }
    //     })
    //         .then(response => response.json())
    //         .catch(error => {
    //             console.error('Error al obtener el empleado y sus citas por ID:', error);
    //         });
    // }


    eliminarEmpleado: (id) => {
        const token = localStorage.getItem('token');
        return fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => response.json())
            .catch(error => {
                console.error('Error al eliminar el empleado:', error);
            });
    },

};

export default EmpleadoService;
