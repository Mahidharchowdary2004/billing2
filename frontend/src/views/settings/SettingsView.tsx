import { useAppDispatch, useAppState } from '../../state/store';
import { PrintFormat } from '../../types';
import { IconSettings } from '../../components/icons';

export default function SettingsView() {
  const { settings } = useAppState();
  const dispatch = useAppDispatch();

  return (
    <>
      <div className="panel">
        <div className="panel-head">
          <h2>
            <IconSettings /> Print Settings
          </h2>
          <span className="hint">Configure default printing formats</span>
        </div>

        <div className="row2" style={{ marginTop: 24 }}>
          <div className="field">
            <label>B2B Wholesale Invoice Format</label>
            <select
              value={settings.b2bPrintFormat}
              onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', settings: { b2bPrintFormat: e.target.value as PrintFormat } })}
            >
              <option value="A4">A4 Size (Detailed)</option>
              <option value="Thermal">Thermal (2"/3" Receipt)</option>
            </select>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 6 }}>Format used when generating new B2B invoices and printing from history.</div>
          </div>

          <div className="field">
            <label>B2C Retail POS Format</label>
            <select
              value={settings.b2cPrintFormat}
              onChange={(e) => dispatch({ type: 'UPDATE_SETTINGS', settings: { b2cPrintFormat: e.target.value as PrintFormat } })}
            >
              <option value="Thermal">Thermal (2"/3" Slip)</option>
              <option value="A4">A4 Size (Standard)</option>
            </select>
            <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 6 }}>Format used for fast retail checkouts.</div>
          </div>
        </div>
      </div>
    </>
  );
}
