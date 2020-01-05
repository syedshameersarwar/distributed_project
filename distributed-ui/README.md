#Continuing 

In Containers/Control, Try to add following above start transaction button
1) SELECT LIST:
	purpose: to select tmp "or" transaction_logs table.
	default: tmp selected by default
2) TABLE(below select list):
	purpose: to show contents of selected table in SELECT LIST
	columns of tmp: record_id(INT), record_type(can 0, 1 or 2)
	columns of transaction_logs: transaction_id, descryption, transaction_timestamp
        operations on tmp:
		1) read only
	operation on transaction_logs:
		1) read, delete, update(description only)
Try to align in center both, above START transaction BUTTON

use ANT-design: https://ant.design/components/table (table)
		https://ant.design/components/select/ (select)