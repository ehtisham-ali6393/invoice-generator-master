import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toPng } from 'html-to-image';
import jsPDF from "jspdf";

function numberToWords(num) {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy",
    "Eighty", "Ninety"
  ];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + inWords(n % 10000000) : "");
  }

  return inWords(num);
}

const InvoiceModal = ({
  isOpen,
  setIsOpen,
  invoiceInfo,
  items,
  onAddNextInvoice,
}) => {
  function closeModal() {
    setIsOpen(false);
  }

  const addNextInvoiceHandler = () => {
    setIsOpen(false);
    onAddNextInvoice();
  };

  // Split items into pages of 10
  const chunkedItems = [];
  for (let i = 0; i < items.length; i += 10) {
    chunkedItems.push(items.slice(i, i + 10));
  }

  const SaveAsPDFHandler = async () => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: [8.25, 11],
    });

    for (let pageIndex = 0; pageIndex < chunkedItems.length; pageIndex++) {
      const dom = document.getElementById(`print-page-${pageIndex}`);
      // Convert this page to PNG
      const dataUrl = await toPng(dom, { quality: 1.0, pixelRatio: 4 });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imgProps = pdf.getImageProperties(img);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(`Invoice ${invoiceInfo.customerName} ${invoiceInfo.today}.pdf`);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeModal}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <span className="inline-block h-screen align-middle" aria-hidden="true">&#8203;</span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">

              {/* Loop through invoice pages */}
              {chunkedItems.map((pageItems, pageIndex) => (
                <div key={pageIndex} className="p-4 page-break" id={`print-page-${pageIndex}`}>
                  {/* ---------- Header ---------- */}
                  <div className="text-center border border-black/50 border-b-0">
                    <img
                      src={`${process.env.PUBLIC_URL}/logo.png`}
                      alt="A R Creation"
                      className="mx-auto w-34 h-16 pt-2"
                    />
                  </div>
                  <div className="p-2 pt-0 text-center border border-black/50 border-t-0 border-b-0 text-[8px]">
                    <span>RZ - 412A, Gali no. 13, Tughlakabad Extension, New Delhi. 110019</span><br />
                    <span>Email : ownerarcreation@gmail.com</span><br />
                    <span>Mobile : 9643251284, 9667038099</span>
                    <div>
                      <span className="font-bold">GSTIN : </span>
                      <span className="font-bold">{invoiceInfo.ownerGstNumber}</span>
                    </div>
                  </div>

                  {/* Invoice meta */}
                  <div className="p-1 pl-2 pr-2 border border-black/50 border-b-0 text-[8px] grid grid-cols-3">
                    <div className='flex '>
                      <span className="font-bold">Invoice :</span>
                      <span className='pl-1'> {invoiceInfo.invoiceNumber} </span>
                    </div>
                    <div className='flex justify-center'>
                      <span className="font-bold">State :</span>
                      <span className='pl-1'> Delhi </span>
                    </div>

                    <div className="flex justify-end">
                      <span className="font-bold">Date :</span>
                      <span className='pl-1'>{invoiceInfo.today}</span>
                    </div>
                  </div>
                  <div className="p-2 grid grid-cols-2 border border-black/50 border-b-0 text-[8px]">
                    <span className="font-bold ">Party's Name :</span>
                    <span>{invoiceInfo.customerName}</span>
                    <span className="font-bold">Billing Address :</span>
                    <span>{invoiceInfo.customerBillingAddress}</span>
                    <span className="font-bold">Party's GSTIN :</span>
                    <span className="font-bold">{invoiceInfo.customerGstNumber}</span>
                  </div>

                  {/* ---------- Items Table ---------- */}
                  <div className="pl-2 pr-2 pb-1 border border-black/50 border-b-0">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-black/50 text-[8px] ">
                          <th className='pt-1 pb-1'>No.</th>
                          <th className='pt-1 pb-1'>ITEM</th>
                          <th className="text-center pt-1 pb-1">HSN</th>
                          <th className="text-center pt-1 pb-1">QTY</th>
                          <th className="text-center pt-1 pb-1">RATE</th>
                          <th className="text-center pt-1 pb-1">AMOUNT</th>
                        </tr>
                      </thead>
                      <tbody className="text-[8px]">
                        {pageItems.map((item, index) => (
                          <tr key={item.id} >
                            <td className="text-left pl-2 pt-0.5 pb-0">{pageIndex * 10 + index + 1}</td>
                            <td className='pt-0 pb-0'>{item.name}</td>
                            <td className="text-center pt-0 pb-0">9988</td>
                            <td className="text-center pt-0 pb-0">{item.qty}</td>
                            <td className="text-center pt-0 pb-0">₹ {Number(item.price).toFixed(2)}</td>
                            <td className="text-center pt-0 pb-0">₹ {Number(item.price * item.qty).toFixed(2)}</td>
                          </tr>
                        ))}
                        {/* Empty rows to keep height fixed */}
                        {Array.from({ length: Math.max(0, 10 - pageItems.length) }).map((_, i) => (
                          <tr key={`empty-${i}`} >
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                            <td>&nbsp;</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ---------- Totals Section (only on last page) ---------- */}
                  {pageIndex === chunkedItems.length - 1 && (
                    <div className="flex flex-row border border-black/50 pl-2 pr-2 text-[8px] ">
                      <div className="w-1/2  ">
                        <div className="flex w-full justify-between pr-2 pt-1">
                          <span className="font-bold">Subtotal :</span>
                          <span className="ml-2">₹ <strong>{invoiceInfo.subtotal.toFixed(2)}</strong></span>
                        </div>
                        <div className="flex w-full justify-between pr-2">
                          <span className="font-bold">CGST :</span>
                          <span className="ml-2">({invoiceInfo.cgst} %) ₹ <strong>{invoiceInfo.cgstRate.toFixed(2)}</strong></span>
                        </div>
                        <div className="flex w-full justify-between pr-2">
                          <span className="font-bold">SGST :</span>
                          <span className="ml-2"> ({invoiceInfo.sgst} %) ₹ <strong>{invoiceInfo.sgstRate.toFixed(2)}</strong></span>
                        </div>
                        <div className="flex w-full justify-between pr-2 pb-1">
                          <span className="font-bold">IGST :</span>
                          <span className="ml-2">({invoiceInfo.igst || '0.0'} %) ₹ <strong>{invoiceInfo.igstRate.toFixed(2)}</strong></span>
                        </div>
                      </div>
                      <div className="w-1/2 pl-2 pt-1 border-l border-black/50">
                        <div>
                          <span className="font-bold">Total :</span>
                          <span className="font-bold ml-1">
                            ₹ {invoiceInfo.total % 1 === 0 ? invoiceInfo.total : invoiceInfo.total.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold">In words :</span>
                          <span className="ml-1 text-[8px]">{numberToWords(Math.floor(invoiceInfo.total))}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ---------- Footer (only last page) ---------- */}
                  {pageIndex === chunkedItems.length - 1 && (
                    <>
                      <div className="flex flex-row border border-black/50 border-t-0 pb-0 text-center">
                        <div className="w-3/5 grid font-bold p-0 text-[8px]">
                          <span className='pt-1 '>Bank Details :</span>
                          <span>Bandhan Bank</span>
                          <span>A/C No. : 10170000343326</span>
                          <span className='pb-1'>IFSC CODE : BDBL0001215</span>
                        </div>
                        <div className="w-2/5 border-l border-black/50 grid pt-0">
                          <span className="pl-0 flex justify-center">
                            <img
                              src={`${process.env.PUBLIC_URL}/sign.png`}
                              alt="Sameer"
                              className="mx-auto w-18 pt-0 h-9 m-0"
                            />
                          </span>
                          <span className="text-[8px] pb-1 text-center">Authorised Signature</span>
                        </div>
                      </div>

                      <div className="p-1 pl-2 pr-2 border border-black/50 border-t-0 text-[8px]">
                        <span className="font-bold">Special Note : </span>
                        <span>{invoiceInfo.splNote}</span>
                      </div>

                      <div className="p-1 pl-2 pr-2 border border-black/50 border-t-0 text-[6px]">
                        <span className="font-bold">Terms & Conditions : </span>
                        <span>All disputes are Subject to Delhi Jurisdiction. Goods once sold will not be taken back. Interest will be charged @ 18%, if bill not paid within 15 days. Our responsibility ceases on Delivery of the carrier.</span>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Buttons */}
              <div className="mt-4 flex space-x-2 px-4 pb-6">
                <button
                  className="flex w-full items-center justify-center space-x-1 rounded-md border border-blue-500 py-2 text-sm text-blue-500 shadow-sm hover:bg-blue-500 hover:text-white"
                  onClick={SaveAsPDFHandler}
                >
                  Download
                </button>
                <button
                  onClick={addNextInvoiceHandler}
                  className="flex w-full items-center justify-center space-x-1 rounded-md bg-blue-500 py-2 text-sm text-white shadow-sm hover:bg-blue-600"
                >
                  Next
                </button>
              </div>

            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InvoiceModal;
