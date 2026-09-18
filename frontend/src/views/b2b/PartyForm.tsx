import { useState } from 'react';
import ModalShell from '../../components/ModalShell';
import { useAppDispatch } from '../../state/store';
import { useUi } from '../../state/ui';
import { HOME_STATE, STATES } from '../../utils';

export default function PartyForm() {
  const dispatch = useAppDispatch();
  const { closeModal, showToast } = useUi();
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');
  const [state, setStateVal] = useState(HOME_STATE);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const save = () => {
    dispatch({
      type: 'ADD_PARTY',
      party: { name: name || 'Unnamed Buyer', gstin: gstin || '—', state, address, phone },
    });
    showToast('Buyer added');
    closeModal();
  };

  return (
    <ModalShell
      title="Add Buyer"
      onClose={closeModal}
      footer={
        <>
          <button className="btn" onClick={closeModal}>
            Cancel
          </button>
          <button className="btn primary" onClick={save}>
            Add buyer
          </button>
        </>
      }
    >
      <div className="field">
        <label>Legal trade name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sri Ganesh Traders" />
      </div>
      <div className="row2">
        <div className="field">
          <label>GSTIN</label>
          <input value={gstin} onChange={(e) => setGstin(e.target.value)} placeholder="36AAACX1234F1Z5" />
        </div>
        <div className="field">
          <label>State</label>
          <select value={state} onChange={(e) => setStateVal(e.target.value)}>
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="row2">
        <div className="field">
          <label>Address</label>
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, City" />
        </div>
        <div className="field">
          <label>Phone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98xxxxxxxx" />
        </div>
      </div>
    </ModalShell>
  );
}
