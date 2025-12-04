import {Dimensions, StyleSheet} from 'react-native';

const {width: screenWidth} = Dimensions.get('window');
export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb'
    },
    postBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderBottomWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 8,
        marginTop: 8,
    },
    postInput: {
        flex: 1,
        marginHorizontal: 10,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f9fafb',
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
    },
    card: {
        backgroundColor: '#fff',

    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingBottom: 8,
    },
    headerInfo: {
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12
    },
    username: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#111827'
    },
    subText: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2
    },
    content: {
        paddingHorizontal: 12,
        marginBottom: 12,
        fontSize: 15,
        color: '#374151',
        lineHeight: 20,
    },
    imageGalleryContainer: {
        position: 'relative',
        marginBottom: 8,
    },
    imageContainer: {
        width: screenWidth - 16,
    },
    postImage: {
        width: screenWidth - 16,
        height: 250,
    },
    imageCounter: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    imageCounterText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },
    statsContainer: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    statsText: {
        fontSize: 13,
        color: '#6b7280',
    },
    actions: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
    },
    actionText: {
        marginLeft: 6,
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    uploadingContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 8,
        marginBottom: 12,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 8,
        elevation: 3,
    },
    uploadingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    uploadingLabel: {
        fontSize: 15,
        color: '#374151',
        fontWeight: '500',
    },
    simpleProgressBar: {
        height: 4,
        backgroundColor: '#e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
    },
    simpleProgressFill: {
        height: '100%',
        backgroundColor: '#2563eb',
        borderRadius: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBody: {
        padding: 16,
        maxHeight: 400,
    },
    input: {
        minHeight: 100,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        textAlignVertical: 'top',
        fontSize: 16,
        backgroundColor: '#f9fafb',
    },
    imagesPreview: {
        marginBottom: 16,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 12,
        marginTop: 8
    },
    selectedImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
    },
    videoLabel: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    submitBtn: {
        backgroundColor: '#2563eb',
        padding: 16,
        margin: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    submitBtnDisabled: {
        backgroundColor: '#9ca3af',
    },
    submitBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    addImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderWidth: 1.5,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        borderStyle: 'dashed',
        backgroundColor: '#f9fafb',
    },
    addImageText: {
        fontSize: 16,
        color: '#1877f2',
        marginLeft: 8,
        fontWeight: '600',
    },
    repostCard: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 10,
        marginHorizontal: 8,
        marginVertical: 8,
    },
    boxCard: {
        marginHorizontal: 8,
    },

});
