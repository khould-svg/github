export type MenuItemType = {
  key: string
  label: string
  isTitle?: boolean
  icon?: string
  url?: string
  badge?: {
    variant: string
    text: string
  }
  parentKey?: string
  isDisabled?: boolean
  collapsed?: boolean
  children?: MenuItemType[]
}

export type SubMenus = {
  item: MenuItemType
  linkClassName?: string
  subMenuClassName?: string
  activeMenuItems?: Array<string>
  toggleMenu?: (item: MenuItemType, status: boolean) => void
  className?: string
}
export type TabMenuItem = {
  index: number
  name: string
  icon: string
}

export const MENU_ITEMS: MenuItemType[] = [
  {
    key: 'menu',
    // label: 'MENU',
    isTitle: true,
    
    label: 'COMMON.MENU',
   
  
  },
  {
    key: 'dashboards',
    label: 'SIDEBAR.DASHBOARDS',
    icon: 'ri-dashboard-2-line',
    url: '/dashboards',
  
  },
  {
    key: 'property',
    label: 'SIDEBAR.PROPERTY',
    icon: 'ri-community-line',
    collapsed: true,
    children: [
      {
        key: 'property-grid',
        label: 'SIDEBAR.PROPERTY_GRID',
        url: '/property/grid',
        parentKey: 'property',
      },
      {
        key: 'property-list',
        label: 'SIDEBAR.PROPERTY_LIST',
        url: '/property/list',
        parentKey: 'property',
      },
      {
        key: 'property-details',
        label: 'SIDEBAR.PROPERTY_DETAILS',
        url: '/property/search',
        parentKey: 'property',
      },
      {
        key: 'add-property',
        label: 'SIDEBAR.ADD_PROPERTY',
        url: '/property/add',
        parentKey: 'property',
      },
    ],
  },
  {
    key: 'customers',
    label: 'SIDEBAR.CUSTOMERS',
    icon: 'ri-contacts-book-3-line',
    collapsed: true,
    children: [
      {
        key: 'list-view',
        label: 'SIDEBAR.CUSTOMERS_LIST',
        url: '/customers/list',
        parentKey: 'customers',
      },
      {
        key: 'grid-view',
        label: 'SIDEBAR.CUSTOMERS_GRID',
        url: '/customers/grid',
        parentKey: 'customers',
      },
      {
        key: 'customer-details',
        label: 'SIDEBAR.CUSTOMER_DETAILS',
        url: '/customers/search',
        parentKey: 'customers',
      },
      {
        key: 'add-customer',
        label: 'SIDEBAR.ADD_CUSTOMER',
        url: '/customers/add',
        parentKey: 'customers',
      },
    ],
  },
 {
  key: 'investment',
  label: 'SIDEBAR.INVESTMENTS',
  icon: 'ri-funds-line',
  url: '/investment',   // يفتح الـ list
},
  {
    key: 'transactions',
    label: 'SIDEBAR.TRANSACTIONS',
    icon: 'ri-arrow-left-right-line',
    url: '/transactions',
  },
   {
    key: 'payments',
    label: 'SIDEBAR.PAYMENTS',
    icon: 'ri-bank-card-line',
    url: '/payments/list',
  
  },
  
  // {
  //   key: 'Settings',
  //   label: 'Settings',
  //   icon: 'ri-arrow-left-right-line',
  //   url: '/settings',
  // }

]
