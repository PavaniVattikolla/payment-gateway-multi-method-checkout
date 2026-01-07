import { useState } from 'react'

const CreditCard = () => {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [holderName, setHolderName] = useState('')

  const handleCardNumberChange = (value) => {
    const cleaned = value.replace(/\D/g, '')
    const formatted = cleaned.replace(/(\d{4})/g, '$1 ').trim()
    setCardNumber(formatted.substring(0, 19))
  }

  const handleExpiryChange = (value) => {
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length >= 2) {
      const formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4)
      setExpiryDate(formatted)
    } else {
      setExpiryDate(cleaned)
    }
  }

  const handleCVVChange = (value) => {
    setCvv(value.replace(/\D/g, '').substring(0, 4))
  }

  return (
    <div data-test-id="credit-card-form" className="credit-card-form">
      <div className="form-group">
        <label>Card Holder Name</label>
        <input
          data-test-id="card-holder-input"
          type="text"
          value={holderName}
          onChange={(e) => setHolderName(e.target.value)}
          placeholder="John Doe"
        />
      </div>
      <div className="form-group">
        <label>Card Number</label>
        <input
          data-test-id="card-number-input"
          type="text"
          value={cardNumber}
          onChange={(e) => handleCardNumberChange(e.target.value)}
          placeholder="1234 5678 9012 3456"
          maxLength="19"
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Expiry Date</label>
          <input
            data-test-id="expiry-input"
            type="text"
            value={expiryDate}
            onChange={(e) => handleExpiryChange(e.target.value)}
            placeholder="MM/YY"
            maxLength="5"
          />
        </div>
        <div className="form-group">
          <label>CVV</label>
          <input
            data-test-id="cvv-input"
            type="text"
            value={cvv}
            onChange={(e) => handleCVVChange(e.target.value)}
            placeholder="123"
            maxLength="4"
          />
        </div>
      </div>
    </div>
  )
}

export default CreditCard
