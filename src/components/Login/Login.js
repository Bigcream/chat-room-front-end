
import { useState, useEffect, useMemo } from 'react';
import classNames from 'classnames';
import styles from './Login.module.scss';
import { Modal } from 'react-bootstrap';
import Button from '~/components/Button';
import Form from "react-bootstrap/Form";

const cx = classNames.bind(styles);
function Login(props) {
    // const [showModal, setShowModal] = useState(false);

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    function validateForm() {
      return email.length > 0 && password.length > 0;
    }
    
    function handleSubmit(event) {
      event.preventDefault();
    }
      
    return (
        
        <div >
            <Button variant="primary" onClick={handleShow}>
                Login
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header  closeButton>
                <Modal.Title className={cx(styles['modal-title'])}>Login With Email</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <Form>
                    <Form.Group size="lg" controlId="email">
                        <div className={cx(styles['div_input_form'])}>
                            <Form.Control
                            autoFocus
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className={cx(styles['input_form'])}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group size="lg" controlId="password">
                        <div className={cx(styles['div_input_form'])}>
                            <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className={cx(styles['input_form'])}
                        />
                        </div>
                    </Form.Group>
                </Form>
                </Modal.Body>
                <Modal.Footer>
                <div className={cx(styles['btn-submit'])}>
                    <Button className={cx(styles['btn-login'])} onClick={() =>handleClose()}>Login</Button>
                    <Button className={cx(styles['btn-register'])} onClick={() =>handleClose()}>Register</Button>
                </div>
                </Modal.Footer>
            </Modal>
        </div>
    ) ;
};

export default Login;
