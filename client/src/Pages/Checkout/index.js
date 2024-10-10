import React, { useContext, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { IoBagCheckOutline } from "react-icons/io5";

import { MyContext } from "../../App";
import { fetchDataFromApi, postData, deleteData } from "../../utils/api";

import { useNavigate } from "react-router-dom";

const Checkout = () => {
  const [formFields, setFormFields] = useState({
    fullName: "",
    country: "",
    streetAddressLine1: "",
    streetAddressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    email: "",
  });

  const [cartData, setCartData] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("online");

  useEffect(() => {
    window.scrollTo(0, 0);
    const user = JSON.parse(localStorage.getItem("user"));
    fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
      setCartData(res);

      setTotalAmount(
        res.length !== 0 &&
          res
            .map((item) => parseInt(item.price) * item.quantity)
            .reduce((total, value) => total + value, 0)
      );
    });
  }, []);

  const onChangeInput = (e) => {
    setFormFields((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const context = useContext(MyContext);
  const history = useNavigate();

  const handlePaymentSuccess = (paymentId) => {
    const user = JSON.parse(localStorage.getItem("user"));

    const addressInfo = {
      name: formFields.fullName,
      phoneNumber: formFields.phoneNumber,
      address: formFields.streetAddressLine1 + formFields.streetAddressLine2,
      pincode: formFields.zipCode,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    };

    const payLoad = {
      name: addressInfo.name,
      phoneNumber: formFields.phoneNumber,
      address: addressInfo.address,
      pincode: addressInfo.pincode,
      amount: parseInt(totalAmount),
      paymentId: paymentId,
      email: user.email,
      userid: user.userId,
      products: cartData,
      date: addressInfo?.date,
      paymentMethod: paymentMethod,
    };

    postData(`/api/orders/create`, payLoad).then((res) => {
      fetchDataFromApi(`/api/cart?userId=${user?.userId}`).then((res) => {
        res?.length !== 0 &&
          res?.map((item) => {
            deleteData(`/api/cart/${item?.id}`).then(() => {});
          });
        setTimeout(() => {
          context.getCartData();
        }, 1000);
        history("/orders");
      });
    });
  };

  const checkout = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (paymentMethod === "online") {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Online payment is not available due to Razorpay account being inactive. Please use Cash on Delivery.",
      });
      return;
    }

    if (paymentMethod === "cod") {
      handlePaymentSuccess("COD");
    }
  };

  const validateForm = () => {
    if (!formFields.fullName) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill full name",
      });
      return false;
    }
    if (!formFields.country) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill country",
      });
      return false;
    }
    if (!formFields.streetAddressLine1) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill street address",
      });
      return false;
    }
    if (!formFields.city) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill city",
      });
      return false;
    }
    if (!formFields.state) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill state",
      });
      return false;
    }
    if (!formFields.zipCode) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill zip code",
      });
      return false;
    }
    if (!formFields.phoneNumber) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill phone number",
      });
      return false;
    }
    if (!formFields.email) {
      context.setAlertBox({
        open: true,
        error: true,
        msg: "Please fill email",
      });
      return false;
    }
    return true;
  };

  return (
    <section className="section">
      <div className="container">
        <form className="checkoutForm" onSubmit={checkout}>
          <div className="row">
            <div className="col-md-8">
              <h2 className="hd">BILLING DETAILS</h2>

              <div className="row mt-3">
                <div className="col-md-6">
                  <TextField
                    label="Full Name *"
                    variant="outlined"
                    className="w-100"
                    size="small"
                    name="fullName"
                    onChange={onChangeInput}
                  />
                </div>
                <br />

                <div className="col-md-6">
                  <TextField
                    label="Country *"
                    variant="outlined"
                    className="w-100"
                    size="small"
                    name="country"
                    onChange={onChangeInput}
                  />
                </div>
              
              </div>  
            
<br />
              <h6>Street address *</h6>

              <TextField
                label="House number and street name"
                variant="outlined"
                className="w-100"
                size="small"
                name="streetAddressLine1"
                onChange={onChangeInput}
              />
                <br />
                

              <TextField
                label="Apartment, suite, unit, etc. (optional)"
                variant="outlined"
                className="w-100"
                size="small"
                name="streetAddressLine2"
                onChange={onChangeInput}
              />

              <h6>Town / City *</h6>

              <TextField
                label="City"
                variant="outlined"
                className="w-100"
                size="small"
                name="city"
                onChange={onChangeInput}
              />

              <h6>State / County *</h6>

              <TextField
                label="State"
                variant="outlined"
                className="w-100"
                size="small"
                name="state"
                onChange={onChangeInput}
              />
          

              <h6>Postcode / ZIP *</h6>

              <TextField
                label="ZIP Code"
                variant="outlined"
                className="w-100"
                size="small"
                name="zipCode"
                onChange={onChangeInput}
              />
    <br />
    <br />
              <div className="row">
                <div className="col-md-6">
                  <TextField
                    label="Phone Number"
                    variant="outlined"
                    className="w-100"
                    size="small"
                    name="phoneNumber"
                    onChange={onChangeInput}
                  />
                </div>

                <div className="col-md-6">
                  <TextField
                    label="Email"
                    variant="outlined"
                    className="w-100"
                    size="small"
                    name="email"
                    onChange={onChangeInput}
                  />
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="orderSummary">
                <h2>YOUR ORDER</h2>
                {cartData?.map((item, index) => (
                  <div className="orderItem" key={index}>
                    <p>{item.name}</p>
                    <p>
                      {item.quantity} x ₹{item.price}
                    </p>
                  </div>
                ))}
                <div className="orderTotal">
                  <h6>Total:</h6>
                  <h6>₹{totalAmount}</h6>
                </div>

                <div className="paymentOptions mt-3">
                  <FormLabel id="paymentMethod">Payment Method</FormLabel>
                  <RadioGroup
                    aria-labelledby="paymentMethod"
                    defaultValue="online"
                    name="paymentMethod"
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <FormControlLabel
                      value="online"
                      control={<Radio />}
                      label="Online Payment"
                    />
                    <FormControlLabel
                      value="cod"
                      control={<Radio />}
                      label="Cash on Delivery"
                    />
                  </RadioGroup>
                </div>

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  className="placeOrderBtn"
                  startIcon={<IoBagCheckOutline />}
                  type="submit"
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Checkout;
