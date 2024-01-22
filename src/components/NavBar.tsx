import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useLocation } from "react-router-dom";

function NavBar() {
	const location = useLocation();
	const active = location.pathname;
	return (
		<Navbar className="bg-body-tertiary mb-3" expand="md">
			<Navbar.Brand className="pe-3 ps-3" href="/">
				Workout Warrior
			</Navbar.Brand>
			<Navbar.Toggle aria-controls="basic-navbar-nav" />
			<Navbar.Collapse id="basic-navbar-nav">
				<Nav
					className="mr-auto"
					variant="tabs"
					defaultActiveKey={active}
				>
					<Nav.Link href="/">Home</Nav.Link>
					<NavDropdown
						active={active === "/custom" || active === "/template"}
						title="Plan"
						id="nav-dropdown"
					>
						<NavDropdown.Item href="/custom">
							Custom Plan Creation
						</NavDropdown.Item>
						<NavDropdown.Item href="/template">
							Plan from Template
						</NavDropdown.Item>
						<NavDropdown.Item href="/edit">
							Edit Plan
						</NavDropdown.Item>
					</NavDropdown>
					<Nav.Link href="/exercises">Exercises</Nav.Link>
					<Nav.Link href="/progress">Progress</Nav.Link>
					<Nav.Link href="/settings">Settings</Nav.Link>
					<Nav.Link href="/about">About</Nav.Link>
				</Nav>
			</Navbar.Collapse>
			<Navbar.Text className="ml-auto pe-3">By Nicholas Lany</Navbar.Text>
		</Navbar>
	);
}

export default NavBar;
