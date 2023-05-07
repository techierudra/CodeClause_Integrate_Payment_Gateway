import React, { useEffect, useState } from "react";
import "./App.css";
import loadScript from "./custom/loadScript";
import axios from "axios";
import StaticPage from "./StaticPage";
import image from './Assets/UPI.png'

const Home = ({ navigation }) => {
  /**
   * Customer Details state
   */
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAmount, setCustomerAmount] = useState("");
  // ----------------------------------------------------------------

  /**
   * Tracking Id and status state
   */
  const [trackId, setTrackId] = useState("");
  const [getStatus, setStatus] = useState("");
  const [throwTrackingId, setThrowTrackingId] = useState({
    condition: false,
    uuid: "",
  });
  // ----------------------------------------------------------------

  /**
   * Button State for actions
   */
  const [dataRecieved, setDataRecieved] = useState(false);
  const [btnClicked, setBtnClicked] = useState(false);
  const [btnDisabled, seBtnDisabled] = useState(false);
  const [formError, setFormError] = useState("");
  // ----------------------------------------------------------------
  //

  /**
   * status - failed || success
   * message - String
   * paymentDetails - Oject
   *          - name : String
   *          - email : String
   *          - phoneNumber : Number
   *          - amount : Number
   *          - razorpay_order_id : String
   *          - razorpay_payment_id : String
   *          - razorpay_signature : String
   *          - payment_date : Date
   */
  const [fetchPayment, setPaymentDetails] = useState({
    status: "",
    message: "",
    paymentDetails: {
      name: "",
      email: "",
      phoneNumber: "",
      amount: "",
      razorpay_order_id: "",
      razorpay_payment_id: "",
      razorpay_signature: "",
      payment_date: "",
    },
  });

  /**
   * - Snippet for Refreshing the details
   */
  const Refresh_details = () => {
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAmount("");
  };

  /**
   * Razorpay Checkout for payment
   */
  const razorpayPopup = () => {
    if (
      customerName !== "" &&
      customerEmail !== "" &&
      customerPhone !== "" &&
      customerPhone.length === 10 &&
      customerAmount !== ""
    ) {
      seBtnDisabled(true);
      loadScript("https://checkout.razorpay.com/v1/checkout.js")
        .then((ok) => {
          // create order and receve the order_id for payment
          axios
            .post("/api/create/order", {
              amount: customerAmount * 100, // amount in the smallest currency unit => (INDIAN Currency) => 100paisa is Rs.1 (so you have to multiply the same ammount wiht 100)
              receipt: "order_rcptid_10", // you can automactically change if you can
            })
            .then((res) => {
              const { orderDetails } = res.data;
              const { amount, id, currency } = orderDetails; // Pulling the some data from the orderDetails

              var options = {
                key: "rzp_test_CQhYw03W2mfalF", // Enter the Key ID generated from the Dashboard
                amount: parseInt(amount), // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                currency: currency,
                name: "Rudra Garai",
                description: "Please donate thank you :)",
                image:
                  {image},
                order_id: id, //This is a sample Order ID. Pass the `id` obtained in the previous step
                handler: (response) => {
                  const datasend = {
                    name: 'customerName',
                    email: customerEmail,
                    amount: parseInt(amount),
                    phoneNumber: customerPhone,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                  };
                  pushDataIntoDatabase(datasend); // send the data for adding in the database
                },
                prefill: {
                  name: customerName,
                  email: customerEmail,
                  contact: customerPhone,
                },
                notes: {
                  address: "Please visit https://github.com/techierudra",
                },
                theme: {
                  color: "#3399cc",
                },
              };
              const paymentScreen = new window.Razorpay(options);
              paymentScreen.open();
              seBtnDisabled(false);
              Refresh_details();
            })
            .catch((err) => {
              alert("server error!");
              seBtnDisabled(false);
            });
        })
        .catch((err) => {
          alert(err);
          seBtnDisabled(false);
        });
    } else {
      seBtnDisabled(false);
      setFormError("Please fill the form carefully");
    }
  };

  /**
   * Connect the database for updating the data
   */
  const pushDataIntoDatabase = (datasend) => {
    axios
      .post("/api/create/order/paymentdetail/Save", datasend, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((item) => {
        setThrowTrackingId({
          condition: true,
          uuid: item?.data?.data?._id,
        });
        Refresh_details();
      })
      .catch((err) => {
        console.log("err :>> ", err);
      });
  };

  /**
   *
   * @param {*} trackingId - Tracking id which you received after successfully use (Try First)
   *
   * - Track Payment details from the server
   */
  const getPaymentDetails = (trackingId) => {
    axios
      .get("/api/trackpayment/details/:id", {
        headers: {
          "Content-Type": "application/json",
          id: trackingId,
        },
      })
      .then((item) => {
        setStatus(item?.data?.status);
        setPaymentDetails({
          status: item?.data?.status,
          message: item?.data?.message,
          paymentDetails: {
            name: 'item?.data?.paymentDetails?.name',
            email: item?.data?.paymentDetails?.email,
            phoneNumber: item?.data?.paymentDetails?.phoneNumber,
            amount: item?.data?.paymentDetails?.amount,
            razorpay_order_id: item?.data?.paymentDetails?.razorpay_order_id,
            razorpay_payment_id:
              item?.data?.paymentDetails?.razorpay_payment_id,
            razorpay_signature: item?.data?.paymentDetails?.razorpay_signature,
            payment_date: item?.data?.paymentDetails?.payment_date,
          },
        });
      })
      .catch((err) => {
        console.log("err :>> ", err);
      });
  };

  /**
   * useEffect helps to render the updated data
   */
  useEffect(() => {}, [btnClicked, dataRecieved]);

  /**
   * Main Function
   */
  return (
    <div>
      <header className="App-header">
        {/*
         *
         * - Throw tracking id after payment done
         *
         */}
        {throwTrackingId.condition ? (
          <div
            className="alert alert-warning alert-dismissible fade show"
            role="alert"
          >
            <div className="me-5" style={{ fontSize: 15 }}>
              <strong>{`Payment Tracking Id →   `}</strong>
              {`  ${throwTrackingId.uuid}`}
            </div>
            <button
              type="button"
              className="btn-close h-25"
              data-bs-dismiss="alert"
              aria-label="Close"
              onClick={(e) => {
                e.preventDefault();
                setThrowTrackingId({
                  condition: false,
                  uuid: "",
                });
              }}
            ></button>
          </div>
        ) : null}
        {/* ------ */}
        
        <img
          src={image}
          width={300}
          height={300}
          alt={"logo"}
          className="logo-design"
        />
        {/* ------- */}

        
       
        {/*
         *
         * - First Try and QR-Code Ends
         *
         */}
        {/**************************************************/}
        {/*
         *
         * - Rest all the Buttons one by one below
         *
         */}
        <div className="after-header">
          {/* <div
            className="ater-header-each"
            style={{
              borderLeft: "none",
            }}
          >
            
          </div> */}
          {/* ********************* */}
          <div className="ater-header-each">
            <StaticPage val={"Pay"} link={"https://buy.stripe.com/test_8wM7uY4cbboY1dmdQQ"} />
          </div>
          {/* ********************* */}
          
        </div>
        {/* ********************* */}
        <div id="razor-btn">
          <form>
            <script
              src="https://checkout.razorpay.com/v1/payment-button.js"
              data-payment_button_id="pl_J096ecINoT34H7"
              async
            ></script>
          </form>
        </div>
        {/*
         *
         * - Rest all the Buttons one by one below
         *
         */}
        {/**************************************************/}
        {/*
         *
         * - Track Payment Data Feature
         *
         */}
        {/*  Button trigger modal for tracking data*/}
        
      </header>
    </div>
  );
};

export default Home;
