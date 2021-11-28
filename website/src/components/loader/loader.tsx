import { MDBSpinner } from 'mdb-react-ui-kit';
import React  from 'react'
const Loader: React.FC = () => {
  return (
    <div className='d-flex justify-content-center align-items-center' style={{ height: "60vh" }}  >
      <MDBSpinner color='success' style={{ width: '3rem', height: '3rem' }}>
        <span className='visually-hidden'>Loading...</span>
      </MDBSpinner>
    </div>
  )
}

export default Loader
