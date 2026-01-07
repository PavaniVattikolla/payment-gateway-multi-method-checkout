import { useState } from 'react'

const BankTransfer = () => {
  const [accountNumber, setAccountNumber] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [confirmTransfer, setConfirmTransfer] = useState(false)

  const banks = [
    { code: 'BOA', name: 'Bank of America' },
    { code: 'WF', name: 'Wells Fargo' },
    { code: 'CHASE', name: 'Chase Bank' },
    { code: 'CITI', name: 'Citibank' }
  ]

  return (
    <div data-test-id="bank-transfer-form" className="bank-transfer-form">
      <div className="form-group">
        <label>Select Bank</label>
        <select
          data-test-id="bank-select"
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value)}
        >
          <option value="">Choose a bank</option>
          {banks.map((bank) => (
            <option key={bank.code} value={bank.code}>
              {bank.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label>Account Holder Name</label>
        <input
          data-test-id="account-holder-input"
          type="text"
          value={accountHolder}
          onChange={(e) => setAccountHolder(e.target.value)}
          placeholder="John Doe"
        />
      </div>
      <div className="form-group">
        <label>Account Number</label>
        <input
          data-test-id="account-number-input"
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Enter account number"
        />
      </div>
      <div className="form-group">
        <label>
          <input
            data-test-id="confirm-transfer-checkbox"
            type="checkbox"
            checked={confirmTransfer}
            onChange={(e) => setConfirmTransfer(e.target.checked)}
          />
          I confirm the transfer details are correct
        </label>
      </div>
    </div>
  )
}

export default BankTransfer
