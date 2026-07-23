import { Button, Stack, Typography } from "@mui/material";

interface Props {
  item: any;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function CartItem({
  item,
  onIncrease,
  onDecrease,
}: Props) {

  return (
    <Stack
      direction="row"
      sx={{ mb: 2, justifyContent: "space-between" }}
    >

      <div>

        <Typography sx={{ fontWeight: "bold" }}>
          {item.name}
        </Typography>

        <Typography variant="body2">
          ₹{item.price}
        </Typography>

      </div>

      <Stack direction="row" spacing={1}>

        <Button
          variant="outlined"
          onClick={onDecrease}
        >
          -
        </Button>

        <Typography sx={{ mt: 1 }}>
          {item.qty}
        </Typography>

        <Button
          variant="outlined"
          onClick={onIncrease}
        >
          +
        </Button>

      </Stack>

    </Stack>
  );
}