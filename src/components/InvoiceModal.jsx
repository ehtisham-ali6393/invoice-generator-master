import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { toPng } from 'html-to-image';
import jsPDF from "jspdf";
import "jspdf-autotable";

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

const SaveAsPDFHandler = () => {
    const dom = document.getElementById('print');
    toPng(dom, { quality: 1.0, pixelRatio: 4 }) // Adjust pixelRatio for higher resolution
      .then((dataUrl) => {
        const img = new Image();
        img.crossOrigin = 'annoymous';
        img.src = dataUrl;
        img.onload = () => {
          // Initialize the PDF.
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'in',
            format: [5.5, 8.5],
          });

          // Define reused data
          const imgProps = pdf.getImageProperties(img);
          const imageType = imgProps.fileType;
          const pdfWidth = pdf.internal.pageSize.getWidth();

          // Calculate the number of pages.
          const pxFullHeight = imgProps.height;
          const pxPageHeight = Math.floor((imgProps.width * 8.5) / 5.5);
          const nPages = Math.ceil(pxFullHeight / pxPageHeight);

          // Define pageHeight separately so it can be trimmed on the final page.
          let pageHeight = pdf.internal.pageSize.getHeight();

          // Create a one-page canvas to split up the full image.
          const pageCanvas = document.createElement('canvas');
          const pageCtx = pageCanvas.getContext('2d');
          pageCanvas.width = imgProps.width;
          pageCanvas.height = pxPageHeight;

          for (let page = 0; page < nPages; page++) {
            // Trim the final page to reduce file size.
            if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
              pageCanvas.height = pxFullHeight % pxPageHeight;
              pageHeight = (pageCanvas.height * pdfWidth) / pageCanvas.width;
            }
            // Display the page.
            const w = pageCanvas.width;
            const h = pageCanvas.height;
            pageCtx.fillStyle = 'white';
            pageCtx.fillRect(0, 0, w, h);
            pageCtx.drawImage(img, 0, page * pxPageHeight, w, h, 0, 0, w, h);

            // Add the page to the PDF.
            if (page) pdf.addPage();

            const imgData = pageCanvas.toDataURL(`image/${imageType}`, 1);
            pdf.addImage(imgData, imageType, 0, 0, pdfWidth, pageHeight);
          }
          // Output / Save
          pdf.save(`Invoice ${invoiceInfo.customerName} ${invoiceInfo.today}.pdf`);
        };
      })
      .catch((error) => {
        console.error('oops, something went wrong!', error);
      });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={closeModal}
      >
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

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
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
              <div className="p-4" id="print">
                
                <div className="text-center border border-black/50 border-b-0">
                  <img 
                    src={`${process.env.PUBLIC_URL}/logo.png`}   // replace with your actual logo path
                    alt="A R Creation" 
                    className="mx-auto w-30 h-16 pt-3 " // adjust size as needed
                  />
                  </div>
                <div className="p-2 pt-0 grid grid-row-2 text-center border border-black/50 border-t-0 border-b-0">
                    <span className="text-[10px]">RZ - 412A, Gali no. 13, Tughlakabad Extension, New Delhi. 110019</span>
                    <span className="text-[10px]">Email : ownerarcreation@gmail.com </span>
                    <span className="text-[10px]"> Mobile : 9643251284, 9667038099</span>
                  <div className='text-[10px]'>
                    <span className="font-bold">GSTIN : </span>
                    <span className="font-bold">{invoiceInfo.ownerGstNumber}</span>
                  </div> 
                </div>

                
                <div className="p-1 pl-2 pr-2 border border-black/50 border-b-0 text-[10px]  flex justify-between">
                  <div>
                    <span className="font-bold">Invoice No. : </span>
                    <span>{invoiceInfo.invoiceNumber}</span>
                  </div>
                  <div>
                    <span className="font-bold">Date : </span>
                    <span>{invoiceInfo.today}</span>
                  </div>
                </div>
                  <div className=" p-2 grid grid-cols-2 border border-black/50 border-b-0 text-[10px]">
                    <span className="font-bold">Party's Name :</span>
                    <span>{invoiceInfo.customerName}</span>
                    <span className="font-bold">Billing Address :</span>
                    <span >{invoiceInfo.customerBillingAddress}</span>
                    <span className="font-bold">Party's GSTIN :</span>
                    <span className="font-bold">{invoiceInfo.customerGstNumber}</span>
                  </div>

                  <div className='pl-2 pr-2 pb-1 border border-black/50 border-b-0'>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-black/50 text-[10px]">
                        <th >ITEM</th>
                        <th className="text-center">HSN</th>
                        <th className="text-center">QTY</th>
                        <th className="text-centre">RATE</th>
                        <th className="text-centre pr-4">AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody className='pl-2 pr-2 text-[10px]'>
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="w-full py-0">{item.name}</td>
                          <td className='w-full py-0 '>9988</td>
                          <td className="min-w-[50px] text-center py-0">{item.qty}</td>
                          <td className="min-w-[70px] pr-0 pl-0 text-centre py-0">
                           ₹ {Number(item.price).toFixed(2)}
                          </td>
                          <td className="min-w-[80px] text-centre py-0">
                           ₹ {Number(item.price * item.qty).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>

                <div className="flex flex-row space-y-2 border border-black/50 pl-2 pr-2 pb-2 text-[10px] ">
                  <div className='w-1/2'>
                    <div className="flex w-full pt-2">
                      <span className="font-bold">Subtotal :</span>
                      <span className='ml-2'>₹ {invoiceInfo.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex w-full ">
                      <span className="font-bold">CGST :</span>
                      <span className='ml-2'>₹ {invoiceInfo.cgstRate.toFixed(2)}</span>
                    </div>
                    <div className="flex w-full ">
                      <span className="font-bold">SGST :</span>
                      <span className='ml-2'>₹ {invoiceInfo.sgstRate.toFixed(2)}</span>
                    </div>
                    <div className="flex w-full">
                      <span className="font-bold">IGST :</span>
                      <span className='ml-2'>₹ {invoiceInfo.igstRate.toFixed(2)}</span>
                    </div>
                  </div>  
                  <div className="w-1/2 pl-2 border-l border-black/50 ">
                    <div>
                      <span className="font-bold">Total :</span>
                      <span className="font-bold ml-2">   
                      ₹ {invoiceInfo.total % 1 === 0
                          ? invoiceInfo.total
                          : invoiceInfo.total.toFixed(2)}
                      </span>
                    </div>
                    <div >
                        <span className="font-bold ">In words :</span>
                        <span className=" ml-2 text-[10px] text-right break-words max-w-[60%]">{numberToWords(Math.floor(invoiceInfo.total))}</span>
                    </div>
                  </div>  
                </div>

                <div className="flex flex-row border border-black/50 border-t-0 text-center">
                  <div className='w-3/5 grid grid-row-2 font-bold p-2'>
                    <span className="text-[10px]">Bank Details :</span>
                    <span className="text-[10px]">Bandhan Bank </span>
                    <span className="text-[10px]">A/C No. : 10170000343326</span>
                    <span className="text-[10px]">IFSC CODE : BDBL0001215</span>
                  </div>
                  <div className='w-2/5 border-l border-black/50 grid grid-row-2 pt-2'>
                    <span className="pl-0 flex justify-center">
                      <img
                        src={`${process.env.PUBLIC_URL}/signature.png`}
                        alt="Sameer"
                        className="mx-auto w-18 h-9 m-2"
                      />
                    </span>
                    <span className="text-[10px] pb-2 text-center">Authorised Signature</span>
                  </div>
                </div>

                <div className="p-1 pl-2 pr-2 border border-black/50 border-t-0 text-[10px]">
                    <span className="font-bold">Special Note : </span>
                    <span>{invoiceInfo.splNote}</span>
                </div>

                <div className="p-1 pl-2 pr-2 border border-black/50 border-t-0 text-[10px]">
                    <span className="font-bold">Terms & Conditions : </span>
                    <span className="text-[10px]"> All disputes are Subject to Delhi Jurisdiction. Goods once sold will not be taken back. Interest will be charged @ 18%, if bill not paid within 15 days. Our responsibility ceases on Delivery of the carrier.</span>
                </div>

                
              </div>
              <div className="mt-4 flex space-x-2 px-4 pb-6">
                <button
                  className="flex w-full items-center justify-center space-x-1 rounded-md border border-blue-500 py-2 text-sm text-blue-500 shadow-sm hover:bg-blue-500 hover:text-white"
                  onClick={SaveAsPDFHandler}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Download</span>
                </button>
                <button
                  onClick={addNextInvoiceHandler}
                  className="flex w-full items-center justify-center space-x-1 rounded-md bg-blue-500 py-2 text-sm text-white shadow-sm hover:bg-blue-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 5l7 7-7 7M5 5l7 7-7 7"
                    />
                  </svg>
                  <span>Next</span>
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
