import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
    postCard: {
        backgroundColor: '#fff',
        marginHorizontal: 12,
        marginTop: 12,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: {width: 0, height: 2},
        shadowRadius: 8,
        elevation: 3,
    },
    postContent: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        marginBottom: 12,
    },
    postImages: {
        marginBottom: 12,
    },
    postImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        marginRight: 8,
    },
    postFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    postStats: {
        flexDirection: 'row',
        gap: 16,
    },
    postStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    postStatText: {
        fontSize: 14,
        color: '#6b7280',
    },
    postTime: {
        fontSize: 12,
        color: '#9ca3af'
    }
});
