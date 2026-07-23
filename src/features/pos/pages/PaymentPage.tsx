import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Paper,
  Typography,
  TextField,
  Button,
} from "@mui/material";

import { saveOrder } from "../services/orderService";
import { cartService } from "../services/cartService";
import { ROUTES } from "@/constants/routes";

export default function PaymentPage() {

  const navigate = useNavigate();

  const [total, setTotal] = useState(0);

  const [received, setReceived] = useState(0);

  useEffect(() => {
    loadTotal();
  }, []);

  async function loadTotal() {
    const cart = await cartService.getCart();
    setTotal(cart.reduce((sum, item) => sum + item.price * item.qty, 0));
  }

  async function confirmPayment() {

    const cart = await cartService.getCart();

    await saveOrder({

      orderNo: Date.now().toString(),

      total,

      items: cart,

    });

    await cartService.clear();

    alert("Order Saved");

    navigate(ROUTES.pos);

  }

  return (

    <Paper sx={{ p: 3 }}>

      <Typography variant="h5">

        Payment

      </Typography>

      <Typography sx={{ mt: 3 }}>

        Total ₹ {total}

      </Typography>

      <TextField

        sx={{ mt: 3 }}

        fullWidth

        label="Cash Received"

        type="number"

        onChange={(e) => setReceived(Number(e.target.value))}

      />

      <Typography sx={{ mt: 2 }}>

        Change ₹ {received - total}

      </Typography>

     <Button

fullWidth

variant="contained"

sx={{ mt: 3 }}

onClick={confirmPayment}

>

Confirm Payment

</Button>

    </Paper>

  );

}
