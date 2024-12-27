import React from 'react'
import {
    MDBContainer,
    MDBNavbar,
    MDBNavbarToggler,
    MDBCollapse,
    MDBIcon,
    MDBNavbarNav,
    MDBNavbarItem,
    MDBNavbarLink
  } from 'mdb-react-ui-kit';
import { NavbarProps } from '../../models/NavbarProps';

const Navbar: React.FC<NavbarProps> = (props: NavbarProps) => {
    return (
        <MDBNavbar expand='sm' dark bgColor='dark'>
            <MDBContainer fluid>
                <MDBNavbarToggler
                aria-controls='navbarSupportedContent'
                aria-expanded='false'
                aria-label='Toggle navigation'
                onClick={() => props.setOpenBasic(!props.openBasic)}>
                    <MDBIcon icon='bars' fas />
                </MDBNavbarToggler>
                <MDBCollapse navbar open={props.openBasic}>
                    <MDBNavbarNav className='mr-auto mb-lg-0'>
                        {props.links.map((link, index) => (
                            <MDBNavbarItem key={index}>
                                <MDBNavbarLink href={link.href}>{link.name}</MDBNavbarLink>
                            </MDBNavbarItem>
                        ))}
                    </MDBNavbarNav>
                </MDBCollapse>
            </MDBContainer>
        </MDBNavbar>
    );
};
  
export default Navbar;