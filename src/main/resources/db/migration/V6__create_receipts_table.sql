CREATE TABLE receipts (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    expense_id BIGINT NOT NULL,
    uploaded_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_receipt_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
);

CREATE INDEX idx_receipts_expense_id ON receipts(expense_id);