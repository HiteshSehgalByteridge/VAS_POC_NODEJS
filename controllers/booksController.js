
const { action, table_name } = require('../enum');

const { ChangeLog } = require('../models/changeLog');

const { Book } = require('../models/book');

const { v4: uuidv4 } = require('uuid');

getBooks = async (req, res) =>
{
    try
    {
        const bookData = await Book.findAll();

        res.status(200).send(
            {
                success: true,
                message: 'getBooks method is called',
                data: bookData
            }
        );
    }
    catch (error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'getBooks method is called',
                error: error.toString()
            }
        );
    }
};

createBook = async (req, res) =>
{
    try
    {
        const { title, author, releaseYear } = req.body;

        const id = uuidv4();

        const bookData = await Book.create(
            {
                id: id,
                title: title,
                author: author,
                releaseYear: releaseYear,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        );

        // console.log('bookData', bookData);

        const changeLogData = await ChangeLog.create(
            {
                tableId: bookData.id,
                action: action.INSERT,
                tableName: table_name.BOOKS,
                isSynced: false,
                data: JSON.stringify(bookData),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        );

        // console.log('changeLogData', changeLogData);

        res.status(200).send(
            {
                success: true,
                message: 'createBook method is called',
                data: bookData
            }
        );
    }
    catch (error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'createBook method is called',
                error: error.toString()
            }
        );
    }
};

updateBook = async (req, res) =>
{
    try
    {
        const { id, author, releaseYear } = req.body;

        const book = await Book.findByPk(id);
       
        // console.log('book', book);

        if (!book)
        {
            return res.status(404).send(
                {
                    success: false,
                    message: 'Book not found'
                }
            );
        }

        // Collect updated fields
        
        const updatedFields = [];
        
        if (author != undefined && book.author !== author)
        {
            updatedFields.push('author');
            book.author = author;
        }

        if (releaseYear != undefined && book.releaseYear !== releaseYear)
        {
            updatedFields.push('releaseYear');
            book.releaseYear = releaseYear;
        }

        book.isActive = true;
        book.updatedAt = new Date();
        
        const bookData = await book.save();

        // console.log('bookData', bookData);

        const changeLogData = await ChangeLog.create(
            {
                tableId: bookData.id,
                action: action.UPDATE,
                tableName: table_name.BOOKS,
                updatedFields: updatedFields.join(','),
                isSynced: false,
                data: JSON.stringify(bookData),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        );

        // console.log('changeLogData', changeLogData);

        res.status(200).send(
            {
                success: true,
                message: 'Book updated successfully',
                data: bookData
            }
        );
    }
    catch (error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'updateBook method is called',
                error: error.toString()
            }
        );
    }
};

deleteBook = async (req, res) =>
{
    try
    {
        const { id } = req.params;

        // console.log('id', id);

        const book = await Book.findByPk(id);
       
        // console.log('book', book);

        if (!book)
        {
            return res.status(404).send(
                {
                    success: false,
                    message: 'Book not found'
                }
            );
        }

        book.isActive = false;
        book.updatedAt = new Date();
        
        const bookData = await book.save();

        // console.log('bookData', bookData);

        const changeLogData = await ChangeLog.create(
            {
                tableId: bookData.id,
                action: action.DELETE,
                tableName: table_name.BOOKS,
                isSynced: false,
                data: JSON.stringify(bookData),
                createdAt: new Date(),
                updatedAt: new Date()
            }
        );
        
        // console.log('changeLogData', changeLogData);

        res.status(200).send(
            {
                success: true,
                message: 'Book deleted successfully',
                data: bookData
            }
        );
    }
    catch (error)
    {
        res.status(500).send(
            {
                success: false,
                message: 'deleteBook method is called',
                error: error.toString()
            }
        );
    }
};

module.exports =
{
    getBooks,
    createBook,
    updateBook,
    deleteBook
};