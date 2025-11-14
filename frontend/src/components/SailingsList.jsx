import React from 'react';

function SailingsList({ sailings, onSelect }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Rota</th>
          <th>Origem → Destino</th>
          <th>Saída</th>
          <th>Passageiros</th>
          <th>Veículos</th>
        </tr>
      </thead>
      <tbody>
        {sailings && sailings.length > 0 ? (
          sailings.map((sailing) => (
            <tr key={sailing.id} onClick={() => onSelect(sailing)} style={{ cursor: 'pointer' }}>
              <td><strong>{sailing.route_name}</strong></td>
              <td>{sailing.origin} → {sailing.destination}</td>
              <td>{new Date(sailing.departure).toLocaleString('pt-BR')}</td>
              <td>
                {sailing.passengers_booked}/{sailing.capacity_passengers}
                <br />
                <small style={{ color: '#666' }}>({sailing.capacity_passengers - sailing.passengers_booked} livres)</small>
              </td>
              <td>
                {sailing.vehicles_booked}/{sailing.capacity_vehicles}
                <br />
                <small style={{ color: '#666' }}>({sailing.capacity_vehicles - sailing.vehicles_booked} livres)</small>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              Nenhuma viagem disponível
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default SailingsList;
