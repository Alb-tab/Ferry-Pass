import React, { useState, useEffect } from 'react';
import { clientAPI, vehicleAPI, ticketAPI, sailingAPI } from '../services/api';

function SellTicketForm({ sailing, sailings, onSuccess }) {
  const [formData, setFormData] = useState({
    cpf: '',
    plate: '',
    sailing_id: sailing?.id || '',
    seat_or_slot: '',
  });

  const [clientData, setClientData] = useState(null);
  const [vehicleData, setVehicleData] = useState(null);
  const [fare, setFare] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCPFChange = async (e) => {
    const cpf = e.target.value;
    setFormData({ ...formData, cpf });

    if (cpf.length === 14 || cpf.length === 11) {
      try {
        const response = await clientAPI.getByCPF(cpf);
        if (response.data && response.data.id) {
          setClientData(response.data);
          setError('');
        } else {
          setClientData(null);
        }
      } catch (err) {
        setClientData(null);
      }
    }
  };

  const handlePlateChange = async (e) => {
    const plate = e.target.value.toUpperCase();
    setFormData({ ...formData, plate });

    if (plate.length >= 4) {
      try {
        const response = await vehicleAPI.getByPlate(plate);
        if (response.data && response.data.id) {
          setVehicleData(response.data);

          // Buscar tarifa
          if (formData.sailing_id && response.data.vehicle_type) {
            const fareResponse = await vehicleAPI.getFare(
              formData.sailing_id,
              response.data.vehicle_type
            );
            setFare(fareResponse.data?.amount || 0);
          }
        } else {
          setVehicleData(null);
          setFare(0);
        }
      } catch (err) {
        setVehicleData(null);
        setFare(0);
      }
    }
  };

  const handleSailingChange = async (e) => {
    const sailing_id = parseInt(e.target.value);
    setFormData({ ...formData, sailing_id });

    // Recalcular tarifa se veículo estiver selecionado
    if (vehicleData && vehicleData.vehicle_type) {
      try {
        const fareResponse = await vehicleAPI.getFare(sailing_id, vehicleData.vehicle_type);
        setFare(fareResponse.data?.amount || 0);
      } catch (err) {
        setFare(0);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (!clientData || !formData.sailing_id || !fare) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      // Criar ticket
      const response = await ticketAPI.create({
        sailing_id: formData.sailing_id,
        client_id: clientData.id,
        vehicle_id: vehicleData?.id || null,
        seat_or_slot: formData.seat_or_slot || null,
        fare_paid: fare,
      });

      setMessage(`✓ Passagem emitida com sucesso!\nCódigo: ${response.data.code}\n\nE-mail enviado para ${clientData.email}`);

      // Limpar formulário
      setFormData({ cpf: '', plate: '', sailing_id: '', seat_or_slot: '' });
      setClientData(null);
      setVehicleData(null);
      setFare(0);

      // Chamar onSuccess se fornecido
      if (onSuccess) onSuccess();

      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Erro ao emitir passagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
      {message && <div className="alert alert-success" style={{ whiteSpace: 'pre-line' }}>{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label>Viagem *</label>
        <select value={formData.sailing_id} onChange={handleSailingChange} required>
          <option value="">Selecione uma viagem</option>
          {sailings && sailings.map((s) => (
            <option key={s.id} value={s.id}>
              {s.route_name} - {new Date(s.departure).toLocaleString('pt-BR')}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>CPF do Cliente *</label>
        <input
          type="text"
          value={formData.cpf}
          onChange={handleCPFChange}
          placeholder="000.000.000-00"
          required
        />
        {clientData && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#d4edda', borderRadius: '4px' }}>
            <strong>Cliente encontrado:</strong> {clientData.name}
            <br />
            <small>Email: {clientData.email} | Telefone: {clientData.phone}</small>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Placa do Veículo (opcional)</label>
        <input
          type="text"
          value={formData.plate}
          onChange={handlePlateChange}
          placeholder="ABC1D23"
        />
        {vehicleData && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#d1ecf1', borderRadius: '4px' }}>
            <strong>Veículo encontrado:</strong> {vehicleData.model}
            <br />
            <small>Tipo: {vehicleData.vehicle_type}</small>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Assento/Slot</label>
        <input
          type="text"
          value={formData.seat_or_slot}
          onChange={(e) => setFormData({ ...formData, seat_or_slot: e.target.value })}
          placeholder="A1"
        />
      </div>

      <div className="form-group">
        <label style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
          Valor: R$ {fare.toFixed(2)}
        </label>
      </div>

      <button type="submit" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Emitindo...' : '✓ Emitir Passagem'}
      </button>
    </form>
  );
}

export default SellTicketForm;
