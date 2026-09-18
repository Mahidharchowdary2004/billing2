import { IconPlus } from '../../components/icons';
import { useAppState } from '../../state/store';
import { useUi } from '../../state/ui';
import { fmt } from '../../utils';
import PartyForm from './PartyForm';

export default function Parties() {
  const { parties, invoices } = useAppState();
  const { openModal } = useUi();

  return (
    <div className="panel">
      <div className="panel-head">
        <h2>Buyer Directory</h2>
        <button className="btn primary" onClick={() => openModal(<PartyForm />)}>
          <IconPlus /> New buyer
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Trade Name</th>
            <th>GSTIN</th>
            <th>State</th>
            <th>Address</th>
            <th>Phone</th>
            <th className="num">Lifetime Billed</th>
          </tr>
        </thead>
        <tbody>
          {parties.map((p) => {
            const billed = invoices.filter((i) => i.party.id === p.id).reduce((a, i) => a + i.total, 0);
            return (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td className="mono">{p.gstin}</td>
                <td>{p.state}</td>
                <td>{p.address}</td>
                <td className="mono">{p.phone}</td>
                <td className="num mono">{fmt(billed)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
