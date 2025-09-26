import React, { useState } from 'react';
import { uid } from 'uid';
import InvoiceItem from './InvoiceItem';
import InvoiceModal from './InvoiceModal';
import incrementString from '../helpers/incrementString';
import Select from 'react-select';

const date = new Date();
const today = date.toLocaleDateString('en-GB', {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
});

const InvoiceForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cgst, setCgst] = useState('2.5');
  const [sgst, setSgst] = useState('2.5');
  const [igst, setIgst] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('Enter Invoice No.');
  const [ownerGstNumber] = useState('07AHJPA8136D1ZN');

  // Customer info
  const [customerGstNumber, setCustomerGstNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [splNote, setSplNote] = useState('');
  const [customerBillingAddress, setCustomerBillingAddress] = useState('');

  // Pre-stored customers
  const customers = [
    
    {
      name: 'Kashmir Loom',
      gst: '07AABCK4463H1ZK',
      address: 'C - 65 Besment, Nizamuddin East, New Delhi - 110013',
    },
    {
      name: 'New Pinch',
      gst: '07AALPK9019N1Z4',
      address: 'C - 124, Dayanand Colony, Lajpat Nagar-IV, New Delhi - 110024',
    },
    {
      name: 'FIL Industies Private Limited',
      gst: '07AAACF3272A1Z7',
      address: ' Plot No.23, Near Pushpa Bhawan Local Shopping Centre, Madangir Opp Pushp Vihar, New Delhi - 110062',
    },
    {
      name: 'Nidhi Creation',
      gst: '07AHEPK5457C1ZI',
      address: ' S-78 / First Floor, Okhla Industrial Area Phase - 2,  New Delhi - 110020',
    },
    {
      name: 'Saltpetre Products & Services Pvt Ltd (OPC)',
      gst: '29AAWCS4503M1ZL',
      address: '524, 16th main, 3rd Block Koramangala, Bangalore - 560034',
    },
  ];

  const [items, setItems] = useState([
    {
      id: uid(6),
      name: '',
      qty: 1,
      price: '1.00',
    },
  ]);

  const reviewInvoiceHandler = (event) => {
    event.preventDefault();
    setIsOpen(true);
  };

  const addNextInvoiceHandler = () => {
    setInvoiceNumber((prevNumber) => incrementString(prevNumber));
    setItems([
      {
        id: uid(6),
        name: '',
        qty: 1,
        price: '1.00',
      },
    ]);
  };

  const addItemHandler = () => {
    const id = uid(6);
    setItems((prevItem) => [
      ...prevItem,
      {
        id: id,
        name: '',
        qty: 1,
        price: '1.00',
      },
    ]);
  };

  const deleteItemHandler = (id) => {
    setItems((prevItem) => prevItem.filter((item) => item.id !== id));
  };

  const edtiItemHandler = (event) => {
    const editedItem = {
      id: event.target.id,
      name: event.target.name,
      value: event.target.value,
    };

    const newItems = items.map((items) => {
      for (const key in items) {
        if (key === editedItem.name && items.id === editedItem.id) {
          items[key] = editedItem.value;
        }
      }
      return items;
    });

    setItems(newItems);
  };

  const subtotal = items.reduce((prev, curr) => {
    if (curr.name.trim().length > 0)
      return prev + Number(curr.price * Math.floor(curr.qty));
    else return prev;
  }, 0);
  const cgstRate = (cgst * subtotal) / 100;
  const sgstRate = (sgst * subtotal) / 100;
  const igstRate = (igst * subtotal) / 100;
  const total = subtotal + cgstRate + sgstRate + igstRate;

  // Handle dropdown select
  const handleCustomerSelect = (option) => {
    const selected = customers.find((c) => c.name === option.value);
    if (selected) {
      setCustomerName(selected.name);
      setCustomerGstNumber(selected.gst);
      setCustomerBillingAddress(selected.address);
    }
  };

  return (
    <form
      className="relative flex flex-col px-2 md:flex-row"
      onSubmit={reviewInvoiceHandler}
    >
      <div className="my-6 flex-1 space-y-2 rounded-md bg-white p-4 shadow-sm sm:space-y-4 md:p-6">
        <div className="flex flex-col justify-between space-y-2 border-b border-gray-900/10 pb-4 md:flex-row md:items-center md:space-y-0">
          <div className="flex space-x-2">
            <span className="font-bold">Current Date : </span>
            <span>{today}</span>
          </div>
          <div className="flex items-center space-x-2">
            <label className="font-bold" htmlFor="invoiceNumber">
              Invoice Number :
            </label>
            <input
              required
              className="max-w-[130px]"
              type="number"
              name="invoiceNumber"
              id="invoiceNumber"
              placeholder='Enter Invoice No.'
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
            />
          </div>
        </div>
        <div className="text-center">
          <img
            src={`${process.env.PUBLIC_URL}/logo.png`}
            alt="A R Creation"
            className="mx-auto w-34 h-20"
          />
        </div>

        {/* Customer Info Section */}
        <div className="grid grid-cols-3 gap-3 pt-4 pb-8">
          {/* Party Name */}
          <label
            htmlFor="customerName"
            className="text-sm font-bold sm:text-base"
          >
            Party Name :
          </label>
          <div className="flex flex-col gap-2 flex-1">
            <Select
              id="customerSelect"
              options={customers.map((c) => ({ value: c.name, label: c.name }))}
              onChange={handleCustomerSelect}
              placeholder="Select Party"
            />
            <input
              className="border rounded px-2 py-1"
              type="text"
              name="customerName"
              id="customerName"
              placeholder="Or enter party name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {/* GSTIN */}
          <label
            htmlFor="customerGstNumber"
            className="col-start-2 row-start-1 text-sm font-bold md:text-base"
          >
            Party's GSTIN :
          </label>
          <input
            className="flex-1 border rounded px-2 py-1"
            type="text"
            id="customerGstNumber"
            placeholder="Party GSTIN"
            value={customerGstNumber}
            onChange={(e) => setCustomerGstNumber(e.target.value)}
          />

          {/* Billing Address */}
          <label
            htmlFor="customerBillingAddress"
            className="col-start-3 row-start-1 text-sm font-bold md:text-base"
          >
            Billing Address :
          </label>
          <input
            className="flex-1 border rounded px-2 py-1"
            type="text"
            id="customerBillingAddress"
            placeholder="Party Billing Address"
            value={customerBillingAddress}
            onChange={(e) => setCustomerBillingAddress(e.target.value)}
          />
        </div>

        {/* Items Table */}
        <table className="w-full p-4 text-left">
          <thead>
            <tr className="border-b border-gray-900/10 text-sm md:text-base">
              <th>Description</th>
              <th className="text-center">HSN</th>
              <th className="text-center">QTY</th>
              <th className="text-center">RATE</th>
              <th className="text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <InvoiceItem
                key={item.id}
                id={item.id}
                name={item.name}
                hsn={item.hsn}
                qty={item.qty}
                price={item.price}
                onDeleteItem={deleteItemHandler}
                onEdtiItem={edtiItemHandler}
              />
            ))}
          </tbody>
        </table>
        <button
          className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white shadow-sm hover:bg-blue-600"
          type="button"
          onClick={addItemHandler}
        >
          Add Item
        </button>

        {/* Special Note + Totals */}
        <div className="flex flex-row ">
          <div className="w-2/6 flex flex-col gap-2 px-1 py-2">
            <label
              htmlFor="splNote"
              className="text-sm font-bold sm:text-base "
            >
              Special Note :
            </label>
            <input
              className="flex-1 border rounded px-4 py-4 text-center"
              placeholder="Enter Note"
              type="text"
              name="splNote"
              id="splNote"
              value={splNote}
              onChange={(event) => setSplNote(event.target.value)}
            />
          </div>

          <div className="w-4/6 flex flex-col items-end space-y-2 pt-2 pr-2">
            <div className="flex w-full justify-between md:w-1/2">
              <span className="font-bold">Subtotal :</span>
              <span> ₹ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex w-full justify-between md:w-1/2">
              <span className="font-bold">CGST :</span>
              <span>
                ({cgst || '0'}%) ₹ {cgstRate.toFixed(2)}
              </span>
            </div>
            <div className="flex w-full justify-between md:w-1/2">
              <span className="font-bold">SGST :</span>
              <span>
                ({sgst || '0'}%) ₹ {sgstRate.toFixed(2)}
              </span>
            </div>
            <div className="flex w-full justify-between md:w-1/2">
              <span className="font-bold">IGST :</span>
              <span>
                ({igst || '0'}%) ₹ {igstRate.toFixed(2)}
              </span>
            </div>

            <div className="flex w-full justify-between border-t border-gray-900/10 pt-2 md:w-1/2">
              <span className="font-bold">Total :</span>
              <span className="font-bold">
                ₹ {total % 1 === 0 ? total : total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="basis-1/4 bg-transparent">
        <div className="sticky top-0 z-10 space-y-4 divide-y divide-gray-900/10 pb-8 md:pt-6 md:pl-4">
          <button
            className="w-full rounded-md bg-blue-500 py-2 text-sm text-white shadow-sm hover:bg-blue-600"
            type="submit"
          >
            Review Invoice
          </button>
          <InvoiceModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            invoiceInfo={{
              today,
              invoiceNumber,
              customerGstNumber,
              customerName,
              customerBillingAddress,
              ownerGstNumber,
              subtotal,
              sgstRate,
              cgstRate,
              igstRate,
              splNote,
              cgst,
              sgst,
              igst,
              total,
            }}
            items={items}
            onAddNextInvoice={addNextInvoiceHandler}
          />

          {/* Tax Inputs */}
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-bold md:text-base" htmlFor="cgst">
                CGST :
              </label>
              <div className="flex items-center">
                <input
                  className="w-full rounded-r-none bg-white shadow-sm"
                  type="number"
                  name="cgst"
                  id="cgst"
                  min="0.01"
                  step="0.01"
                  placeholder="0.0"
                  value={cgst}
                  onChange={(event) => setCgst(event.target.value)}
                />
                <span className="rounded-r-md bg-gray-200 py-2 px-4 text-gray-500 shadow-sm">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold md:text-base" htmlFor="sgst">
                SGST :
              </label>
              <div className="flex items-center">
                <input
                  className="w-full rounded-r-none bg-white shadow-sm"
                  type="number"
                  name="sgst"
                  id="sgst"
                  min="0"
                  step="0.01"
                  placeholder="0.0"
                  value={sgst}
                  onChange={(event) => setSgst(event.target.value)}
                />
                <span className="rounded-r-md bg-gray-200 py-2 px-4 text-gray-500 shadow-sm">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold md:text-base" htmlFor="igst">
                IGST :
              </label>
              <div className="flex items-center">
                <input
                  className="w-full rounded-r-none bg-white shadow-sm"
                  type="number"
                  name="igst"
                  id="igst"
                  min="0"
                  step="0.01"
                  placeholder="0.0"
                  value={igst}
                  onChange={(event) => setIgst(event.target.value)}
                />
                <span className="rounded-r-md bg-gray-200 py-2 px-4 text-gray-500 shadow-sm">
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;
