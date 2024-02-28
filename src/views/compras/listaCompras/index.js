import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import CompraDataService from 'src/views/services/compraService';
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
  CModal,
  CModalTitle,
  CModalHeader,
  CModalBody,
  CModalFooter
} from '@coreui/react';

function formatFechaCompra(fecha) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return new Date(fecha).toLocaleDateString('es-ES', options);
}

async function getNombresProductos(detalle, tipoCompra) {
  try {
    let response;
    if (tipoCompra === 'Producto') {
      response = await CompraDataService.getAllProductosbyId(detalle.id_producto);
    } else if (tipoCompra === 'Insumo') {
      response = await CompraDataService.getAllProductosbyIdInsu(detalle.id_insumo);
    } else {
      throw new Error('Tipo de compra no válido');
    }
    return { [detalle.id_producto]: response.data.nombre };
  } catch (error) {
    console.error('Error al obtener el nombre del producto:', error);
    return { [detalle.id_producto]: 'Nombre no disponible' };
  }
}

function ListaCompras() {
  const [compras, setCompras] = useState([]);
  const [visible, setVisible] = useState(false);
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);
  const [tablaActualizada, setTablaActualizada] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await CompraDataService.getCompraDetalle();
        console.log('Datos:', response.data);

        const comprasConDetalle = await Promise.all(response.data.map(async item => {
          const compra = {
            descripcion: item.compra.descripcion,
            id_compra: item.compra.id_compra,
            tipoCompra: item.compra.tipoCompra,
            estado: item.compra.estado,
            created_at: item.compra.created_at,
          };

          const detallesCompraP = item.detallesCompraP.map(detalle => ({
            id_producto: detalle.id_producto,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            precioVenta: detalle.precioVenta,
            total: detalle.total,
          }));

          const detallesCompraIn = item.detallesCompraIn.map(detalle => ({
            id_insumo: detalle.id_insumo,
            cantidad: detalle.cantidad,
            precioUnitario: detalle.precioUnitario,
            precioVenta: detalle.precioVenta,
            total: detalle.total,
          }));

          const detallesCompra = [...detallesCompraP, ...detallesCompraIn];

          const nombresPromises = detallesCompra.map(detalle => getNombresProductos(detalle, compra.tipoCompra));

          const nombresProductosArray = await Promise.all(nombresPromises);
          const nombresProductosObj = Object.assign({}, ...nombresProductosArray);

          return {
            compra: {
              ...compra,
              total: detallesCompra.reduce((total, detalle) => total + detalle.total, 0),
            },
            detallesCompra,
            nombresProductos: nombresProductosObj,
          };
        }));

        setCompras(comprasConDetalle);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }

      setTablaActualizada(false);
    };

    fetchData();
  }, [tablaActualizada]);

  const mostrarDetalleCompra = (compra) => {
    setCompraSeleccionada(compra);
    setVisible(true);
  };

  const pagarCompra = async (idCompra) => {
    try {
      await CompraDataService.cambiarEstadoCompra(idCompra);
      setTablaActualizada(true);
      Swal.fire('Éxito', 'La compra se ha pagado exitosamente', 'success');
    } catch (error) {
      Swal.fire('Error', 'No se pudo realizar el pago', 'error');
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard>
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <strong>Lista de Compras</strong>
              <div className="d-flex align-items-center">
                <Link to="/compras/crear-compra">
                  <CButton color="success">Agregar Producto</CButton>
                </Link>
                |
                <Link to="/compras/crear-comprainsu">
                  <CButton color="success" className="ml-2">Agregar Insumo</CButton>
                </Link>
              </div>
            </div>
          </CCardHeader>
          <CCardBody>
            <CTable align="middle" className="mb-0 border" hover responsive>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell scope="col">#</CTableHeaderCell>
                  <CTableHeaderCell scope="col">DESCRIPCIÓN</CTableHeaderCell>
                  <CTableHeaderCell scope="col">TOTAL</CTableHeaderCell>
                  <CTableHeaderCell scope="col">TIPO DE COMPRA</CTableHeaderCell>
                  <CTableHeaderCell scope="col">ESTADO</CTableHeaderCell>
                  <CTableHeaderCell scope="col">FECHA DE COMPRA</CTableHeaderCell>
                  <CTableHeaderCell scope="col"></CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {Array.isArray(compras) && compras.length > 0 ? (
                  compras.map((compra, i) => (
                    <CTableRow key={i}>
                      <CTableHeaderCell scope="row">{i + 1}</CTableHeaderCell>
                      <CTableDataCell>{compra.compra.descripcion}</CTableDataCell>
                      <CTableDataCell>{compra.compra.total}</CTableDataCell>
                      <CTableDataCell>{compra.compra.tipoCompra}</CTableDataCell>
                      <CTableDataCell>{compra.compra.estado}</CTableDataCell>
                      <CTableDataCell>{formatFechaCompra(compra.compra.created_at)}</CTableDataCell>
                      <CTableDataCell>
                        <CButton color="warning" onClick={() => pagarCompra(compra.compra.id_compra)}>
                          Pagar
                        </CButton>
                        <CButton onClick={() => mostrarDetalleCompra(compra)}>Detalle</CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))
                ) : (
                  <CTableRow></CTableRow>
                )}
              </CTableBody>
            </CTable>
            <CModal
              alignment="center"
              visible={visible}
              onClose={() => setVisible(false)}
              aria-labelledby="ScrollingLongContentExampleLabel2"
            >
              <CModalHeader>
                <CModalTitle id="ScrollingLongContentExampleLabel2">Detalle de la Compra</CModalTitle>
              </CModalHeader>
              <CModalBody>
                {compraSeleccionada && (
                  <>
                    <p><strong>Descripción:</strong> {compraSeleccionada.compra.descripcion}</p>
                    <p><strong>Total:</strong> {compraSeleccionada.compra.total}</p>
                    <p><strong>Estado:</strong> {compraSeleccionada.compra.estado}</p>
                    <p><strong>Fecha de Compra:</strong> {formatFechaCompra(compraSeleccionada.compra.created_at)}</p>
                    <h5>Detalles de la Compra:</h5>
                    <CTable>
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell scope="col">#</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Nombre</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Cantidad</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Precio Unitario</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Precio Venta</CTableHeaderCell>
                          <CTableHeaderCell scope="col">Total</CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {compraSeleccionada.detallesCompra.map((detalle, index) => (
                          <CTableRow key={index}>
                            <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                            <CTableDataCell>
                              {compraSeleccionada.nombresProductos[detalle.id_producto] || 'Cargando...'}
                            </CTableDataCell>
                            <CTableDataCell>{detalle.cantidad}</CTableDataCell>
                            <CTableDataCell>{detalle.precioUnitario}</CTableDataCell>
                            <CTableDataCell>{detalle.precioVenta}</CTableDataCell>
                            <CTableDataCell>{detalle.total}</CTableDataCell>
                          </CTableRow>
                        ))}
                      </CTableBody>
                    </CTable>
                  </>
                )}
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setVisible(false)}>
                  Cerrar
                </CButton>
              </CModalFooter>
            </CModal>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
}

export default ListaCompras;
