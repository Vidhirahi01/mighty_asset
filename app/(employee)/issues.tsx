import { View } from 'react-native';
import { Text } from '@/components/ui/text';

export default function EmployeeIssuesScreen() {
	return (
		<View className="flex-1 items-center justify-center bg-background px-6">
			<Text className="text-lg font-semibold text-foreground">Issues</Text>
			<Text className="mt-2 text-center text-sm text-muted-foreground">
				This screen is ready. You can connect issue list data here.
			</Text>
		</View>
	);
}
