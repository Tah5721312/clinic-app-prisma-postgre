'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Invoice, InvoiceFilters, Doctor } from '@/lib/types';
import InvoiceTable from '@/components/InvoiceTable';
import InvoiceForm from '@/components/InvoiceForm';
import Button from '@/components/buttons/Button';
import { toastError } from '@/lib/toast';
import { DOMAIN } from '@/lib/constants';
import { useDoctors, useSpecialties } from '@/hooks/useApiData';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [filters, setFilters] = useState<InvoiceFilters>({});
  const [tempFilters, setTempFilters] = useState<InvoiceFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [isDoctorDropdownOpen, setIsDoctorDropdownOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [identificationNumber, setIdentificationNumber] = useState('');

  // Fetch specialties and doctors
  const { data: specialties } = useSpecialties();
  const { data: doctors } = useDoctors(selectedSpecialty || undefined);

  // Fetch invoices on mount
  useEffect(() => {
    fetchInvoices({});
  }, []);

  // Fetch invoices
  const fetchInvoices = async (filterParams?: InvoiceFilters) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filterParams?.patient_id)
        queryParams.append('patient_id', filterParams.patient_id.toString());
      if (filterParams?.payment_status)
        queryParams.append('payment_status', filterParams.payment_status);
      if (filterParams?.date_from)
        queryParams.append('date_from', filterParams.date_from);
      if (filterParams?.date_to)
        queryParams.append('date_to', filterParams.date_to);
      if (filterParams?.doctor_id)
        queryParams.append('doctor_id', filterParams.doctor_id.toString());
      if (filterParams?.specialty)
        queryParams.append('specialty', filterParams.specialty);

      const response = await fetch(
        `${DOMAIN}/api/invoices?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters function
  const applyFilters = () => {
    const finalFilters: InvoiceFilters = {
      ...tempFilters,
      payment_status: tempFilters.payment_status || undefined,
      date_from: selectedDate || tempFilters.date_from || undefined,
      doctor_id: selectedDoctor || tempFilters.doctor_id || undefined,
      specialty: selectedSpecialty || undefined,
    };
    
    // Add identification number if provided
    if (identificationNumber && identificationNumber.trim()) {
      // This will be handled in fetchInvoices
      setFilters(finalFilters);
      fetchInvoicesWithIdentification(finalFilters, identificationNumber.trim());
    } else {
      setFilters(finalFilters);
      fetchInvoices(finalFilters);
    }
  };

  // Fetch invoices with identification number
  const fetchInvoicesWithIdentification = async (filterParams: InvoiceFilters, idNumber: string) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (idNumber) {
        queryParams.append('identificationNumber', idNumber);
      }
      if (filterParams?.patient_id)
        queryParams.append('patient_id', filterParams.patient_id.toString());
      if (filterParams?.payment_status)
        queryParams.append('payment_status', filterParams.payment_status);
      if (filterParams?.date_from)
        queryParams.append('date_from', filterParams.date_from);
      if (filterParams?.date_to)
        queryParams.append('date_to', filterParams.date_to);
      if (filterParams?.doctor_id)
        queryParams.append('doctor_id', filterParams.doctor_id.toString());
      if (filterParams?.specialty)
        queryParams.append('specialty', filterParams.specialty);

      const response = await fetch(
        `${DOMAIN}/api/invoices?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };


  // Filter invoices based on search term
  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      invoice.INVOICE_NUMBER.toLowerCase().includes(searchLower) ||
      invoice.PATIENT_NAME?.toLowerCase().includes(searchLower) ||
      invoice.DOCTOR_NAME?.toLowerCase().includes(searchLower) ||
      invoice.PATIENT_EMAIL?.toLowerCase().includes(searchLower)
    );
  });

  const handleCreateInvoice = () => {
    router.push('/invoices/new');
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowForm(true);
  };

  const handleDeleteInvoice = async (invoiceId: number) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      const response = await fetch(`${DOMAIN}/api/invoices/${invoiceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete invoice');
      }

      // Remove the invoice from the list
      setInvoices((prev: Invoice[]) => prev.filter((inv) => inv.INVOICE_ID !== invoiceId));
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  };

  const handlePaymentUpdate = async (
    invoiceId: number,
    paidAmount: number,
    paymentMethod?: string
  ) => {
    try {
      const response = await fetch(
        `${DOMAIN}/api/invoices/${invoiceId}/payment`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paid_amount: paidAmount,
            payment_method: paymentMethod,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update payment');
      }

      // Update the invoice in the list
      setInvoices((prev: Invoice[]) =>
        prev.map((inv) =>
          inv.INVOICE_ID === invoiceId
            ? {
                ...inv,
                PAID_AMOUNT: paidAmount,
                PAYMENT_METHOD: paymentMethod,
                PAYMENT_STATUS:
                  paidAmount >= inv.TOTAL_AMOUNT
                    ? 'paid'
                    : paidAmount > 0
                    ? 'partial'
                    : 'unpaid',
                REMAINING_AMOUNT: inv.TOTAL_AMOUNT - paidAmount,
              }
            : inv
        )
      );
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Failed to update payment');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingInvoice(null);
    fetchInvoices(filters);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingInvoice(null);
  };

  const handleFilterChange = (
    key: keyof InvoiceFilters,
    value: string | number | undefined
  ) => {
    setTempFilters((prev: InvoiceFilters) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    setSelectedDoctor(null);
    setTempFilters((prev: InvoiceFilters) => ({
      ...prev,
      doctor_id: undefined,
    }));
  };

  const handleDoctorSelect = (doctorId: number | null) => {
    setSelectedDoctor(doctorId);
    setTempFilters((prev: InvoiceFilters) => ({
      ...prev,
      doctor_id: doctorId || undefined,
    }));
    setIsDoctorDropdownOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500 text-white',
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-orange-500 text-white',
      'bg-teal-500 text-white',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const clearFilters = () => {
    setFilters({});
    setTempFilters({});
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedDoctor(null);
    setSelectedDate('');
    setIdentificationNumber('');
    fetchInvoices({});
  };

  // Date navigation helper functions
  const incrementDateByDays = (baseDateStr: string, days: number) => {
    const base = baseDateStr ? new Date(baseDateStr) : new Date();
    const next = new Date(base);
    next.setDate(base.getDate() + days);
    return next.toISOString().split('T')[0];
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    const nextDate = incrementDateByDays(selectedDate, 1);
    setSelectedDate(nextDate);
  };

  const handlePrevDay = () => {
    if (!selectedDate) return;
    const prevDate = incrementDateByDays(selectedDate, -1);
    setSelectedDate(prevDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setSelectedDate(date);
    setFilters(prev => ({ ...prev, date_from: date || undefined }));
  };

  // Current date label for display
  const currentDateLabel = selectedDate 
    ? new Date(selectedDate).toLocaleDateString('ar-EG', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : 'اختر التاريخ';


  if (showForm) {
    return (
      <InvoiceForm
        patientId={editingInvoice ? String(editingInvoice.PATIENT_ID) : undefined}
        appointmentId={editingInvoice && editingInvoice.APPOINTMENT_ID != null ? String(editingInvoice.APPOINTMENT_ID) : undefined}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
        editData={editingInvoice ? {
          patient_id: editingInvoice.PATIENT_ID as number,
          appointment_id: editingInvoice.APPOINTMENT_ID ?? undefined,
          amount: (editingInvoice.AMOUNT ?? editingInvoice.TOTAL_AMOUNT) as number,
          discount: editingInvoice.DISCOUNT,
          notes: editingInvoice.NOTES ?? undefined,
          payment_method: editingInvoice.PAYMENT_METHOD ?? undefined,
          paid_amount: editingInvoice.PAID_AMOUNT,
          invoice_id: editingInvoice.INVOICE_ID,
        } : undefined}
      />
    );
  }

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4'>
        <div className='flex items-center'>
          <Receipt className='h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mr-2 sm:mr-3' />
          <div>
            <h1 className='text-xl sm:text-2xl font-bold '>Invoices</h1>
            <p className='text-sm sm:text-base '>
              Manage patient invoices and payments
            </p>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
          <Button
            variant='primary'
            onClick={handleCreateInvoice}
            className='flex items-center justify-center w-full sm:w-auto'
            size='sm'
          >
            <Plus className='h-4 w-4 mr-2' />
            <span className='hidden sm:inline'>New Invoice</span>
            <span className='sm:hidden'>New</span>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className='card p-3 sm:p-4 rounded-lg shadow'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4'>
          {/* Search - Client-side filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Search
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder='Search invoices...'
                className='pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          {/* Payment Status */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Payment Status
            </label>
            <select
              value={tempFilters.payment_status || ''}
              onChange={(e) =>
                handleFilterChange(
                  'payment_status',
                  e.target.value || undefined
                )
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All Statuses</option>
              <option value='unpaid'>Unpaid</option>
              <option value='partial'>Partial</option>
              <option value='paid'>Paid</option>
              <option value='cancelled'>Cancelled</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              From Date
            </label>
            <input
              type='date'
              value={selectedDate || ''}
              onChange={handleDateChange}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
            {selectedDate && (
              <div className='mt-2 flex items-center justify-between gap-2'>
                <button
                  type='button'
                  onClick={handlePrevDay}
                  className='inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm'
                  aria-label='اليوم السابق'
                  title='اليوم السابق'
                >
                  <ChevronLeft className='w-4 h-4 mr-1' />
                </button>

                <span className='text-sm card-title text-center flex-1'>
                  {currentDateLabel}
                </span>

                <button
                  type='button'
                  onClick={handleNextDay}
                  className='inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 text-sm'
                  aria-label='اليوم التالي'
                  title='اليوم التالي'
                >
                  <ChevronRight className='w-4 h-4 ml-1' />
                </button>
              </div>
            )}
          </div>

          {/* Specialty Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Specialty
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => handleSpecialtyChange(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>All Specialties</option>
              {specialties?.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Doctor Filter */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Doctor
            </label>
            <div className='relative'>
              <button
                type='button'
                onClick={() => setIsDoctorDropdownOpen(!isDoctorDropdownOpen)}
                className='card-title w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between'
              >
                <div className='flex items-center'>
                  {selectedDoctor && doctors ? (
                    (() => {
                      const doctor = doctors.find(d => d.DOCTOR_ID === selectedDoctor);
                      return doctor ? (
                        <>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(doctor.NAME)} shadow-sm mr-2`}>
                            {doctor.IMAGE ? (
                              <img 
                                src={doctor.IMAGE} 
                                alt={doctor.NAME}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getInitials(doctor.NAME)
                            )}
                          </div>
                          <span className='truncate'>{doctor.NAME}</span>
                        </>
                      ) : (
                        <span>Select Doctor</span>
                      );
                    })()
                  ) : (
                    <span>Select Doctor</span>
                  )}
                </div>
                <ChevronDown className='w-4 h-4' />
              </button>
              
              {isDoctorDropdownOpen && (
                <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto'>
                  <button
                    type='button'
                    onClick={() => handleDoctorSelect(null)}
                    className='w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center'
                  >
                    <div className='w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2'>
                      <span className='text-xs card-title'>All</span>
                    </div>
                    <span className='font-medium card-title '>All Doctors</span>
                  </button>
                  {doctors?.map((doctor) => (
                    <button
                      key={doctor.DOCTOR_ID}
                      type='button'
                      onClick={() => handleDoctorSelect(doctor.DOCTOR_ID)}
                      className='w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center'
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getAvatarColor(doctor.NAME)} shadow-sm mr-2`}>
                        {doctor.IMAGE ? (
                          <img 
                            src={doctor.IMAGE} 
                            alt={doctor.NAME}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          getInitials(doctor.NAME)
                        )}
                      </div>
                      <div>
                        <div className='font-medium card-title '>{doctor.NAME}</div>
                        <div className='text-sm text-gray-500'>{doctor.SPECIALTY}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Identification Number */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              الرقم القومى
            </label>
            <input
              type='text'
              value={identificationNumber}
              onChange={(e) => setIdentificationNumber(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  applyFilters();
                }
              }}
              placeholder='الرقم القومى'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mt-4'>
          <div className='flex flex-col sm:flex-row gap-2'>
            <Button 
              variant='primary' 
              size='sm' 
              onClick={applyFilters}
              className='flex items-center justify-center w-full sm:w-auto'
              disabled={loading}
            >
              <Filter className='h-4 w-4 mr-1' />
              Apply Filters
            </Button>
            <Button variant='outline' size='sm' onClick={clearFilters} className='w-full sm:w-auto'>
              Clear Filters
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fetchInvoices(filters)}
              className='flex items-center justify-center w-full sm:w-auto'
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className='text-sm text-gray-500 text-center sm:text-right'>
            {filteredInvoices.length} invoice
            {filteredInvoices.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className='flex justify-center items-center py-12'>
          <RefreshCw className='h-8 w-8 animate-spin text-blue-600' />
          <span className='ml-2 text-gray-600'>Loading invoices...</span>
        </div>
      ) : (
        /* Invoices Table */
        <InvoiceTable
          invoices={filteredInvoices}
          onEdit={handleEditInvoice}
          onDelete={handleDeleteInvoice}
          onPaymentUpdate={handlePaymentUpdate}
          showPatientColumn={true}
          showActions={true}
        />
      )}
    </div>
  );
}
