-- Insert 5 Wallet Transactions
INSERT INTO "wallet_transactions" (user_id, amount, type, description)
SELECT u.id, 50.00, 'TOPUP', 'Welcome Bonus'
FROM users u
WHERE u.email LIKE 'cust%@example.com'
LIMIT 5
ON CONFLICT DO NOTHING;
