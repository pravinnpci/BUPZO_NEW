const fs = require('fs');
const file = 'bupzo-backend/app/main.py';
let content = fs.readFileSync(file, 'utf8');

// Update UserUpdate model
content = content.replace(
  "    pincode: Optional[str] = None",
  "    pincode: Optional[str] = None\n    password: Optional[str] = None\n    status: Optional[str] = None"
);

// Update update_user endpoint
content = content.replace(
  "    if payload.pincode is not None:\n        fields.append(f\"pincode = ${counter}\")\n        values.append(payload.pincode)\n        counter += 1\n        \n    if not fields:",
  "    if payload.pincode is not None:\n        fields.append(f\"pincode = ${counter}\")\n        values.append(payload.pincode)\n        counter += 1\n        \n    if payload.password is not None and payload.password.strip():\n        from passlib.hash import bcrypt\n        fields.append(f\"password_hash = ${counter}\")\n        values.append(bcrypt.hash(payload.password))\n        counter += 1\n        \n    if not fields:"
);

fs.writeFileSync(file, content);
