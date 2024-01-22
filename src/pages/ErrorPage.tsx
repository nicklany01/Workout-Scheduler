import { useRouteError } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";

function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <Container className="d-flex align-items-center justify-content-center vh-100">
            <Card style={{ maxWidth: "400px" }} className="text-center">
                <Card.Body>
                    <Card.Title>Oops!</Card.Title>
                    <Card.Text>
                        Sorry, an unexpected error has occurred.
                    </Card.Text>
                    <Card.Text>
                        <i>
                            {(error as Error)?.message ||
                                (error as { statusText?: string })?.statusText}
                        </i>
                    </Card.Text>
                    <Card.Text>
                        <Button href="/">Click here to go home</Button>
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default ErrorPage;
