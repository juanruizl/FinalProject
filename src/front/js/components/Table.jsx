import React from "react";
import PropTypes from "prop-types";

const Table = ({ headers, data, onEdit, onDelete }) => {
    return (
        <div className="table-responsive">
            <table className="table table-striped table-hover table-bordered">
                <thead className="thead-dark">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} scope="col">
                                {header}
                            </th>
                        ))}
                        {(onEdit || onDelete) && <th scope="col">Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {headers.map((header, index) => (
                                    <td key={index}>{row[header]}</td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td>
                                        {onEdit && (
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => onEdit(row)}
                                            >
                                                Editar
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => onDelete(row)}
                                            >
                                                Eliminar
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={headers.length + (onEdit || onDelete ? 1 : 0)} className="text-center">
                                No hay datos disponibles.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// PropTypes para garantizar la correcta implementación
Table.propTypes = {
    headers: PropTypes.arrayOf(PropTypes.string).isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
};

// Default props en caso de que no se envíen funciones de acción
Table.defaultProps = {
    onEdit: null,
    onDelete: null,
};

export default Table;
