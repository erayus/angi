import { MDBBadge, MDBCheckbox, MDBListGroup, MDBListGroupItem } from 'mdb-react-ui-kit';
import React from 'react'
import { useStore } from '../../store/rootStore';

interface IProps {

}

const ToBuyList: React.FC<IProps> = () => {
    const { foodStore } = useStore();
    const { foodThisWeek } = foodStore;
    return (
        <div className="mt-3">
            <MDBListGroup className="mx-auto" style={{ maxWidth: '22rem' }}>
                <MDBListGroupItem className="d-flex justify-content-between align-items-center">
                    <MDBCheckbox label="yoooo" />
                    <MDBBadge pill>2</MDBBadge>
                </MDBListGroupItem>
            </MDBListGroup>
        </div>
    )
}
export default ToBuyList;
