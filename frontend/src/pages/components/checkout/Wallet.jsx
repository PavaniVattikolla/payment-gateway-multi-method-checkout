import { useState } from 'react'

const Wallet = () => {
  const [walletId, setWalletId] = useState('')
  const [selectedWallet, setSelectedWallet] = useState('apple-pay')

  const wallets = [
    { id: 'apple-pay', name: 'Apple Pay', icon: '🍎' },
    { id: 'google-pay', name: 'Google Pay', icon: '🔵' },
    { id: 'paypal', name: 'PayPal', icon: '₱' }
  ]

  return (
    <div data-test-id="wallet-form" className="wallet-form">
      <div className="wallet-options">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            data-test-id={`wallet-option-${wallet.id}`}
            className={`wallet-option ${selectedWallet === wallet.id ? 'selected' : ''}`}
            onClick={() => setSelectedWallet(wallet.id)}
          >
            <span className="wallet-icon">{wallet.icon}</span>
            <span className="wallet-name">{wallet.name}</span>
          </div>
        ))}
      </div>
      <div className="form-group">
        <label>Wallet ID</label>
        <input
          data-test-id="wallet-id-input"
          type="text"
          value={walletId}
          onChange={(e) => setWalletId(e.target.value)}
          placeholder="Enter your wallet ID"
        />
      </div>
    </div>
  )
}

export default Wallet
