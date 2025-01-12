const db = require('../config/db');

class managerController {
    showStaff(req, res) {
        const sql =
            ' \
            SELECT DISTINCT u.userName as staffName, u.email, u.address, w.workingDate FROM USER as u \
            JOIN WORK_ON as w \
            on u.userId = w.staffId \
            WHERE w.branchId IN (SELECT branchId from WORK_ON \
            WHERE staffId = ?) AND u.role = "staff"';

        db.query(sql, [req.userId], (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results);
        });
    }

    showCustomer(req, res) {
        const sql =
            ' \
            SELECT DISTINCT u.userName as CusName, u.email, u.address,  FROM USER as u \
            WHERE  u.role = "customer"';

        db.query(sql, (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results);
        });
    }

    addStaff(req, res) {
        // const staffId = req.body.userId;
        // if (!staffId) return res.sendStatus(400);
        // const sql = 'SELECT role FROM USER WHERE userId = ?';
        // db.query(sql, [staffId], (err, results) => {
        //     if (err) return res.sendStatus(500);
        //     if(!results[0] || results[0].role !== 'customer') return res.sendStatus(400);

        //     const sql1 = 'SELECT branchId FROM Work_on WHERE staffId = ?';
        //     db.query(sql1, [req.userId], (err, results) => {
        //         if (err) return res.sendStatus(500);
        //         const sql2 =
        //             'BEGIN;\
        //             INSERT INTO WORK_ON(staffId, branchId) VALUES (?,?); \
        //             UPDATE USER SET role = "staff" WHERE userId = ?;\
        //             COMMIT;';
        //         const values = [ 
        //             staffId,
        //             results[0].branchId,
        //             staffId,
        //         ];

        //         db.query(sql2, values, (err) => {
        //             if (err) return res.sendStatus(500);
        //             res.sendStatus(201);
        //         });
        //     });
        // });
        var idBranch;
        var userIdStaff;

        const sql =
        'INSERT INTO user(userName, password, email, address)\
        VALUE (?,?,?,?)';
        const values = [
            req.body.userName,
            req.body.password,
            req.body.email,
            req.body.address
        ];

        db.query(sql, values, (err) => {
            if (err) {
                return res.sendStatus(409);
            }
            const sql1 = 'SELECT userId From USER where userName = ? and password = ?';
            db.query(sql1, [req.body.userName, req.body.password], (err,results) => {
                if (err || !results) {
                    return res.sendStatus(409);
                }
                userIdStaff = results[0].userId;
                console.log(results[0].userId, userIdStaff);
                const sql2 = 'SELECT branchId From Branch where managerId = ?';
                db.query(sql2, [req.userId], (err,results) => {
                    if (err || !results) {
                        return res.sendStatus(409);
                    }
                    idBranch = results[0].branchId;
                    console.log(userIdStaff, idBranch);
                    const sql3 = 'BEGIN;\
                        INSERT INTO WORK_ON(staffId, branchId) VALUES (?,?); \
                        UPDATE USER SET role = "staff" WHERE userId = ?;\
                        COMMIT;';
                    const values3 = [ 
                        userIdStaff,
                        idBranch,
                        userIdStaff,
                    ];

                    db.query(sql3, values3, (err) => {
                        if (err) return res.sendStatus(503);
                        res.sendStatus(201);
                    });
                });
            });
        });  
    }
    deleteStaff(req, res) {
        const staffId = req.body.userId;
        if (!staffId) return res.sendStatus(400);

        const sql1 = 'SELECT branchId FROM WORK_ON as W \
            JOIN user as u \
            ON w.staffId = u.userId \
            WHERE staffId = ? and u.role = "staff"';
            db.query(sql1, [staffId], (err, staff) => {
            if(err) return res.sendStatus(500);
            if(!staff[0]) return res.sendStatus(400);

            const sql2 = 'SELECT branchId FROM WORK_ON WHERE staffId = ?';
            db.query(sql2, [req.userId], (err, manager) => {
                if(err) return res.sendStatus(500);
                if(manager[0].branchId !== staff[0].branchId) return res.sendStatus(400);

                const sql3 =
                'BEGIN;\
                DELETE FROM WORK_ON WHERE staffId = ? AND branchId = ?; \
                COMMIT;';
                const values = [
                    staffId,
                    staff[0].branchId
                ];

                db.query(sql3, values, (err) => {
                    if (err) return res.sendStatus(500);
                    res.sendStatus(201);
                });

            })

        })
    }
    

    // addBook(req, res) {
    //     // add book
    //     const sql =
    //         'INSERT INTO book(bookId, title, genre, publicationYear, availableCopies, salePrice, authorId)\
    // VALUES (?,?,?,?,?,?,?)';
    //     const values = [
    //         req.body.bookId,
    //         req.body.title,
    //         req.body.genre,
    //         req.body.publicationYear,
    //         req.body.availableCopies,
    //         req.body.salePrice,
    //         req.body.authorId,
    //     ];

    //     db.query(sql, values, (err) => {
    //         if (err) {
    //             return res.sendStatus(500);
    //         }
    //         res.sendStatus(201);
    //     });
    // }

    // changeBookinfo(req, res) {
    //     const sql =
    //         'UPDATE book SET title = ?, genre = ?, publicationYear = ?, availableCopies = ?, salePrice = ?, authorId = ? WHERE bookId = ?';
    //     const values = [
    //         req.body.title,
    //         req.body.genre,
    //         req.body.publicationYear,
    //         req.body.availableCopies,
    //         req.body.salePrice,
    //         req.body.authorId,
    //         req.body.bookId,
    //     ];

    //     db.query(sql, values, (err) => {
    //         if (err) {
    //             return res.sendStatus(500);
    //         }
    //         res.sendStatus(201);
    //     });
    // }

    addBookCopies(req, res) {
        for (let i = 0; i < req.body.numCopies; i++) {
            const sql =
                'INSERT INTO book_copy(branchId, bookId)\
    VALUES (?,?)';
            const values = [req.body.branchId, req.body.bookId];

            db.query(sql, values, (err) => {
                if (err) {
                    return res.sendStatus(500);
                }
            });

            const sql1 =
                'UPDATE book SET availableCopies = availableCopies - 1 WHERE bookId = ?';
            db.query(sql1, [req.body.bookId], (err) => {
                if (err) return res.sendStatus(500);
            });
        }
        res.sendStatus(201);
    }
}

module.exports = new managerController();
