import { currency, currentYear } from '@common/constants'
import { CustomerName } from '@core/services/customer.service'
export type CustomerStatType = {
  title: string;   // مفتاح الترجمة
  amount: number;  // الرقم
  change: number;  // نسبة التغيير %
  variant: 'primary' | 'warning' | 'info' | 'success' | 'danger';
  icon: string;    // iconify
};



export type CustomerType = {
  id: string
  name: string | { ar?: string; en?: string }
  image: string
  email: string
  phone: string
  date: string
  status: string
  customerStatus: string
  type: string
  address: string
  propertyView: number
  propertyOwn: number
  invest: string
  _id?: string
  fullName?: string
  username?: string
  avatar?: string
  mobile?: string
  customerType?: string
  statusText?: string
  createdAt?: string
  updatedAt?: string
  investment?: string
    displayName?: string;

}


// export type CustomerType = {
//   _id?: string;              // لو جاي من Mongo
//   id: string;               // fallback لو backend بيرجع id
//   name: string | { ar?: string; en?: string };
//   email: string;
//   phone: string;
//   country?: string;          // 👈 من Grid
//   role?: string;             // 👈 من Grid
//   status: string;
//   profileImage?: string;
//   image?: string;

//   // أعمدة خاصة بالـ List
//   type?: string;
//   address?: string;
//   customerStatus?: string;
//   date?: string;
//   propertyView?: number;
//   propertyOwn?: number;
//   invest?: string;

//   // helper field
//   displayName?: string;
// };
export const customerData: CustomerType[] = [
  {
    id: '201',
    name: 'Daavid Nummi',
    image: 'assets/images/users/avatar-2.jpg',
    email: 'daavidnumminen@teleworm.us',
    phone: '+231 06-75820711',
    type: 'Residential',
    address: '123 Maple St, 456 Oak Ave',
    customerStatus: 'Interested',
    date: '15/03/' + currentYear,
    status: 'Available',
    propertyView: 231,
    propertyOwn: 27,
    invest: '928,128',
  },
  {
    id: '202',
    name: 'Sinikka Penttinen',
    image: 'assets/images/users/avatar-3.jpg',
    email: 'sinikkapenttinen@dayrep.com',
    phone: '+231 47-23456789',
    type: 'Commercial',
    address: '789 Pine Blvd',
    customerStatus: 'Under Review',
    date: '20/03/' + currentYear,
    status: 'Available',
    propertyView: 134,
    propertyOwn: 13,
    invest: '435,892',
  },
  {
    id: '203',
    name: 'Jere Palmu',
    image: 'assets/images/users/avatar-4.jpg',
    email: 'jerepalmu@rhyta.com',
    phone: '+231 73-34567890',
    type: 'Residential',
    address: '101 Birch Ct, 202 Cedar Ln',
    customerStatus: 'Follow-up',
    date: '25/03/' + currentYear,
    status: 'Available',
    propertyView: 301,
    propertyOwn: 15,
    invest: '743,120',
  },
  {
    id: '204',
    name: 'Ulla Nuorela',
    image: 'assets/images/users/avatar-5.jpg',
    email: 'ullanuorela@rhyta.com',
    phone: '+231 45-45678901',
    type: 'Residential',
    address: '303 Elm St',
    customerStatus: 'Interested',
    date: '05/04/' + currentYear,
    status: 'Unavailable',
    propertyView: 109,
    propertyOwn: 7,
    invest: '635,812',
  },
  {
    id: '205',
    name: 'Tiia Karppinen',
    image: 'assets/images/users/avatar-6.jpg',
    email: 'tiiakarppinen@teleworm.us',
    phone: '+231 16-56789012',
    type: 'Industrial',
    address: '404 Walnut Rd',
    customerStatus: 'Follow-up',
    date: '12/04/' + currentYear,
    status: 'Available',
    propertyView: 142,
    propertyOwn: 18,
    invest: '733,291',
  },
  {
    id: '206',
    name: 'Harland R. Orsini',
    image: 'assets/images/users/avatar-7.jpg',
    email: 'harlandrorsini@dayrep.com',
    phone: '+231 82-67890123',
    type: 'Residential',
    address: '505 Spruce St',
    customerStatus: 'Interested',
    date: '15/04/' + currentYear,
    status: 'Unavailable',
    propertyView: 109,
    propertyOwn: 10,
    invest: '831,760',
  },
  {
    id: '207',
    name: 'David Padgett',
    image: 'assets/images/users/avatar-8.jpg',
    email: 'davidpadgett@armyspy.com',
    phone: '+231 92-78901234',
    type: 'Commercial',
    address: '606 Fir Ave',
    customerStatus: 'Under Review',
    date: '18/04/' + currentYear,
    status: 'Available',
    propertyView: 231,
    propertyOwn: 27,
    invest: '928,128',
  },
  {
    id: '208',
    name: 'Valerie Obrien',
    image: 'assets/images/users/avatar-9.jpg',
    email: 'valerieobrien@dayrep.com',
    phone: '+231 82-89012345',
    type: 'Residential',
    address: '808 Willow Dr, 909 Aspen Ln',
    customerStatus: 'Interested',
    date: '20/04/' + currentYear,
    status: 'Available',
    propertyView: 231,
    propertyOwn: 27,
    invest: '928,128',
  },
]

export type PropertyCardType = {
  title: string
  Property: number
  icon: string
  count: string
  progress: number
  variant: string
}



export type TransactionType = {
  order_id: string
  date: string
  type: string
  address: string
  amount: string
  status: string
  customer: string
}

